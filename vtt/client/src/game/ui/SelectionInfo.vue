<script setup lang="ts">
import { computed, onBeforeUnmount, ref, type DeepReadonly } from "vue";
import { useI18n } from "vue-i18n";

import RotationSlider from "../../core/components/RotationSlider.vue";
import type { GlobalId } from "../../core/id";
import { SERVER_SYNC } from "../../core/models/types";
import { activeShapeStore } from "../../store/activeShape";
import { socket } from "../api/socket";
import { getGlobalId, getLocalId, getShape } from "../id";
import { accessState } from "../systems/access/state";
import { auraSystem } from "../systems/auras";
import type { Aura, AuraId } from "../systems/auras/models";
import { noteState } from "../systems/notes/state";
import { type ClientNote, NoteManagerMode } from "../systems/notes/types";
import { editNote, openNoteManager, popoutNote } from "../systems/notes/ui";
import { propertiesSystem } from "../systems/properties";
import { useShapeProps } from "../systems/properties/composables";
import { selectedState } from "../systems/selected/state";
import { trackerSystem } from "../systems/trackers";
import type { Tracker, TrackerId } from "../systems/trackers/models";
import { uiSystem } from "../systems/ui";

import TrackerInput from "./TrackerInput.vue";

const { t } = useI18n();
const shapeProps = useShapeProps();

const activeTracker = ref<Tracker | Aura | null>(null);
const conditionRevision = ref(0);

const conditionDefinitions = [
    { id: "blinded", label: "Cego" },
    { id: "charmed", label: "Enfeitiçado" },
    { id: "deafened", label: "Surdo" },
    { id: "frightened", label: "Amedrontado" },
    { id: "grappled", label: "Agarrado" },
    { id: "incapacitated", label: "Incapacitado" },
    { id: "invisible", label: "Invisível" },
    { id: "paralyzed", label: "Paralisado" },
    { id: "petrified", label: "Petrificado" },
    { id: "poisoned", label: "Envenenado" },
    { id: "prone", label: "Caído" },
    { id: "restrained", label: "Impedido" },
    { id: "stunned", label: "Atordoado" },
    { id: "unconscious", label: "Inconsciente" },
    { id: "exhaustion", label: "Exaustão" },
    { id: "concentrating", label: "Concentrando" },
] as const;
const conditionIds: ReadonlySet<string> = new Set(conditionDefinitions.map(({ id }) => id));

const linkedConditions = computed(() => {
    const revision = conditionRevision.value;
    const shapeId = selectedState.reactive.focus;
    if (shapeId === undefined) return null;

    const shape = getShape(shapeId);
    const characterId = shape?.options.dndchanCharacterId;
    if (!shape || typeof characterId !== "string") return null;

    return {
        characterId,
        conditions: Array.isArray(shape.options.dndchanConditions) ? shape.options.dndchanConditions : [],
        revision,
    };
});

function applyConditionUpdate(data: {
    shape: GlobalId;
    characterId: string;
    condition?: string;
    active?: boolean;
    conditions?: string[];
}): void {
    const localId = getLocalId(data.shape, false);
    if (localId === undefined) return;

    const shape = getShape(localId);
    if (!shape || shape.options.dndchanCharacterId !== data.characterId) return;

    if (Array.isArray(data.conditions)) {
        shape.options.dndchanConditions = data.conditions.filter((condition) => conditionIds.has(condition));
    } else if (data.condition && conditionIds.has(data.condition) && typeof data.active === "boolean") {
        const conditions = new Set(shape.options.dndchanConditions ?? []);
        if (data.active) conditions.add(data.condition);
        else conditions.delete(data.condition);
        shape.options.dndchanConditions = [...conditions];
    } else {
        return;
    }

    shape.invalidate(false);
    conditionRevision.value++;
}

socket.on("Character.Condition.Toggle", applyConditionUpdate);
socket.on("Character.Condition.Sync", applyConditionUpdate);
const refreshConditionConnection = (): void => {
    conditionRevision.value++;
};
socket.on("connect", refreshConditionConnection);
socket.on("disconnect", refreshConditionConnection);
onBeforeUnmount(() => {
    socket.off("Character.Condition.Toggle", applyConditionUpdate);
    socket.off("Character.Condition.Sync", applyConditionUpdate);
    socket.off("connect", refreshConditionConnection);
    socket.off("disconnect", refreshConditionConnection);
});

function toggleCondition(condition: string): void {
    const shapeId = selectedState.raw.focus;
    if (!accessState.hasEditAccess.value || shapeId === undefined) return;

    const shape = getShape(shapeId);
    const globalId = getGlobalId(shapeId);
    const characterId = shape?.options.dndchanCharacterId;
    if (!shape || !globalId || typeof characterId !== "string") return;

    const previousConditions = [...(shape.options.dndchanConditions ?? [])];
    const conditions = new Set(previousConditions);
    const active = !conditions.has(condition);
    if (active) conditions.add(condition);
    else conditions.delete(condition);
    shape.options.dndchanConditions = [...conditions];
    shape.invalidate(false);
    conditionRevision.value++;

    socket.emit(
        "Character.Condition.Toggle",
        { shape: globalId, characterId, condition, active },
        (result: { ok?: boolean; siteSynced?: boolean } | undefined) => {
            if (!result?.ok) {
                shape.options.dndchanConditions = previousConditions;
                shape.invalidate(false);
                conditionRevision.value++;
                console.warn("Não foi possível salvar a condição no PlanarAlly.");
            } else if (!result.siteSynced) {
                console.warn("A condição foi salva no grid, mas não sincronizada com a ficha do site.");
            }
        },
    );
}

const trackers = computed(() => trackerSystem.state.trackers.slice(0, -1));

const auras = computed(() => auraSystem.state.auras.slice(0, -1));

const notes = computed(
    () =>
        noteState.reactive.shapeNotes
            .get1(selectedState.reactive.focus!)
            ?.map((note) => noteState.reactive.notes.get(note)!) ?? [],
);

function setLocked(): void {
    const shapeId = selectedState.raw.focus;
    if (accessState.hasEditAccess.value && shapeId !== undefined) {
        propertiesSystem.setLocked(shapeId, !shapeProps.value!.isLocked, SERVER_SYNC);
    }
}

function openEditDialog(): void {
    activeShapeStore.setShowEditDialog(true);
}

function changeValue(tracker: Tracker | Aura): void {
    if (selectedState.raw.focus === undefined || !accessState.hasEditAccess.value) return;

    activeTracker.value = tracker;
}

function setValue(data: { solution: number; relativeMode: boolean }): void {
    const tracker = activeTracker.value;

    const shapeId = selectedState.raw.focus;
    if (shapeId === undefined || tracker === null) return;
    activeTracker.value = null; // close the modal

    const value = data.relativeMode ? tracker.value + data.solution : data.solution;
    if (trackers.value.some((tr) => tr.uuid === tracker.uuid)) {
        trackerSystem.update(shapeId, tracker.uuid as TrackerId, { value }, SERVER_SYNC);
    } else {
        auraSystem.update(shapeId, tracker.uuid as AuraId, { value }, SERVER_SYNC);
        const sh = getShape(shapeId)!;
        sh.invalidate(false);
    }
}

// NOTES

const expandNotes = ref(false);

function openNotes(): void {
    const shapeId = selectedState.raw.focus;
    if (shapeId === undefined) return;

    openNoteManager(NoteManagerMode.List, shapeId);
}

function annotate(note: DeepReadonly<ClientNote>): void {
    uiSystem.setAnnotationText(note.text);
}
</script>

<template>
    <div>
        <TrackerInput :tracker="activeTracker" @submit="setValue" @close="activeTracker = null" />
        <template v-if="shapeProps">
            <div id="selection-menu">
                <section class="selection-card">
                    <header class="selection-header">
                        <div id="selection-name">
                            {{
                                shapeProps.name === "Unknown Shape"
                                    ? t("game.ui.selection.SelectionInfo.unknown_shape")
                                    : shapeProps.name
                            }}
                        </div>
                        <div class="selection-actions">
                            <button
                                id="selection-lock-button"
                                type="button"
                                :title="t('game.ui.selection.SelectionInfo.lock')"
                                :aria-label="t('game.ui.selection.SelectionInfo.lock')"
                                @click="setLocked"
                            >
                                <font-awesome-icon v-if="shapeProps.isLocked" icon="lock" />
                                <font-awesome-icon v-else icon="unlock" />
                            </button>
                            <button
                                id="selection-edit-button"
                                type="button"
                                :title="t('game.ui.selection.SelectionInfo.open_shape_props')"
                                :aria-label="t('game.ui.selection.SelectionInfo.open_shape_props')"
                                @click="openEditDialog"
                            >
                                <font-awesome-icon icon="edit" />
                            </button>
                        </div>
                    </header>
                    <div id="selection-values" :class="{ noAccess: !accessState.hasEditAccess.value }">
                        <template v-for="tracker in trackers" :key="tracker.uuid">
                            <div class="selection-value-name">{{ tracker.name }}</div>
                            <button
                                type="button"
                                class="selection-tracker-value"
                                :disabled="!accessState.hasEditAccess.value"
                                :title="t('game.ui.selection.SelectionInfo.quick_edit_tracker')"
                                @click="changeValue(tracker)"
                            >
                                <template v-if="tracker.maxvalue === 0">
                                    {{ tracker.value }}
                                </template>
                                <template v-else>{{ tracker.value }} / {{ tracker.maxvalue }}</template>
                            </button>
                        </template>
                        <template v-for="aura in auras" :key="aura.uuid">
                            <div class="selection-value-name">{{ aura.name }}</div>
                            <div class="selection-aura-value">
                                <button
                                    class="slider-checkbox"
                                    :aria-label="aura.name"
                                    :aria-pressed="aura.active"
                                    @click="
                                        auraSystem.update(aura.shape, aura.uuid, { active: !aura.active }, SERVER_SYNC)
                                    "
                                />
                                <template v-if="aura.angle < 360">
                                    <RotationSlider
                                        :angle="aura.direction"
                                        :show-number-input="false"
                                        :disabled="!accessState.hasEditAccess.value"
                                        @input="
                                            (direction) =>
                                                auraSystem.update(aura.shape, aura.uuid, { direction }, SERVER_SYNC)
                                        "
                                        @change="
                                            (direction) =>
                                                auraSystem.update(aura.shape, aura.uuid, { direction }, SERVER_SYNC)
                                        "
                                    />
                                </template>
                            </div>
                        </template>
                    </div>
                    <section v-if="linkedConditions" :key="linkedConditions.revision" class="selection-conditions">
                        <div class="selection-conditions-title">Condições da ficha</div>
                        <div class="selection-condition-list">
                            <button
                                v-for="condition in conditionDefinitions"
                                :key="condition.id"
                                type="button"
                                :class="{ 'is-active': linkedConditions.conditions.includes(condition.id) }"
                                :aria-pressed="linkedConditions.conditions.includes(condition.id)"
                                :disabled="!accessState.hasEditAccess.value || !socket.connected"
                                @click="toggleCondition(condition.id)"
                            >
                                {{ condition.label }}
                            </button>
                        </div>
                    </section>
                </section>
                <section class="info-notes">
                    <button
                        type="button"
                        class="notes-header"
                        :title="
                            notes.length > 0
                                ? expandNotes
                                    ? t('game.ui.selection.SelectionInfo.collapse_notes')
                                    : t('game.ui.selection.SelectionInfo.expand_notes')
                                : ''
                        "
                        :aria-expanded="expandNotes"
                        @click="notes.length > 0 && (expandNotes = !expandNotes)"
                    >
                        <font-awesome-icon
                            icon="note-sticky"
                            :title="t('game.ui.selection.SelectionInfo.open_note_manager_title')"
                            @click.stop="openNotes"
                        />
                        <span>{{ notes.length }} {{ t("game.ui.selection.SelectionInfo.notes") }}</span>
                        <span class="notes-spacer"></span>
                        <font-awesome-icon
                            v-if="notes.length > 0"
                            :icon="expandNotes ? 'chevron-up' : 'chevron-down'"
                        />
                    </button>
                    <template v-if="expandNotes">
                        <div v-for="note of notes" :key="note.uuid" class="note-row" @pointerenter="annotate(note)">
                            <div>{{ note.title }}</div>
                            <span class="notes-spacer"></span>
                            <button
                                type="button"
                                :title="t('game.ui.notes.NoteDialog.pop_out')"
                                :aria-label="t('game.ui.notes.NoteDialog.pop_out')"
                                @click="popoutNote(note.uuid)"
                            >
                                <font-awesome-icon :icon="['far', 'window-restore']" />
                            </button>
                            <button
                                type="button"
                                :title="t('game.ui.notes.NoteDialog.open_in_manager')"
                                :aria-label="t('game.ui.notes.NoteDialog.open_in_manager')"
                                @click="editNote(note.uuid)"
                            >
                                <font-awesome-icon icon="cog" />
                            </button>
                        </div>
                    </template>
                </section>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
#selection-menu {
    position: absolute;
    top: 1rem;
    right: 17.5rem;
    z-index: 8;
    width: min(22rem, calc(100vw - 19rem));
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    max-height: min(70vh, 36rem);
    border: 1px solid rgba(192, 132, 212, 0.32);
    border-radius: 0.85rem;
    overflow: auto;
    background: rgba(20, 15, 26, 0.97);
    color: #f4edf8;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);
    backdrop-filter: blur(12px);
}

.selection-card {
    min-width: 0;
    padding: 0.8rem;
}

.selection-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
}

#selection-name {
    min-width: 0;
    color: #fff;
    font-size: 1rem;
    font-weight: 750;
    overflow-wrap: anywhere;
}

.selection-actions {
    display: flex;
    flex: 0 0 auto;
    gap: 0.35rem;

    button {
        display: grid;
        width: 2rem;
        height: 2rem;
        place-items: center;
        border: 1px solid rgba(192, 132, 212, 0.28);
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.04);
        color: #e0aaff;
        cursor: pointer;

        &:hover {
            border-color: #e0aaff;
            background: rgba(156, 39, 176, 0.22);
            color: #fff;
        }
    }
}

#selection-values {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.4rem 0.75rem;
    margin-top: 0.7rem;
    padding-top: 0.7rem;
    border-top: 1px solid rgba(192, 132, 212, 0.18);
    color: #cfc2d5;
    font-size: 0.82rem;

    .selection-value-name {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    .selection-tracker-value {
        min-width: 3.5rem;
        padding: 0.25rem 0.45rem;
        border: 1px solid rgba(192, 132, 212, 0.25);
        border-radius: 0.4rem;
        background: rgba(255, 255, 255, 0.04);
        color: #f4edf8;
        font: inherit;
        text-align: center;

        &:not(:disabled) {
            cursor: pointer;

            &:hover {
                border-color: #e0aaff;
                background: rgba(156, 39, 176, 0.2);
            }
        }
    }

    .selection-aura-value {
        display: flex;
        align-items: center;
        justify-self: end;
        gap: 0.5rem;
    }

    &.noAccess .selection-tracker-value {
        cursor: not-allowed;
    }
}

.selection-conditions {
    margin-top: 0.75rem;
    padding-top: 0.7rem;
    border-top: 1px solid rgba(192, 132, 212, 0.18);
}

.selection-conditions-title {
    margin-bottom: 0.55rem;
    color: #bda9c5;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.selection-condition-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;

    button {
        padding: 0.28rem 0.55rem;
        border: 1px solid rgba(192, 132, 212, 0.2);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: #cfc2d5;
        font: inherit;
        font-size: 0.7rem;
        cursor: pointer;

        &:hover:not(:disabled) {
            border-color: #c084d4;
            color: #fff;
        }

        &.is-active {
            border-color: #c084d4;
            background: rgba(156, 39, 176, 0.24);
            color: #f3d9ff;
        }

        &:disabled {
            cursor: default;
            opacity: 0.58;
        }
    }
}

.info-notes {
    border-top: 1px solid rgba(192, 132, 212, 0.2);
    background: rgba(8, 7, 11, 0.48);
}

.notes-header,
.note-row {
    display: flex;
    width: 100%;
    min-height: 2.4rem;
    align-items: center;
    gap: 0.6rem;
    padding: 0.45rem 0.75rem;
    border: 0;
    background: transparent;
    color: #ded3e4;
    font: inherit;
    font-size: 0.8rem;
    text-align: left;
}

.notes-header {
    cursor: pointer;

    &:hover {
        background: rgba(156, 39, 176, 0.12);
        color: #fff;
    }
}

.note-row {
    border-top: 1px solid rgba(255, 255, 255, 0.05);

    > div:first-child {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    button {
        display: grid;
        width: 1.8rem;
        height: 1.8rem;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid transparent;
        border-radius: 0.4rem;
        background: transparent;
        color: #c9ad6a;
        cursor: pointer;

        &:hover {
            border-color: var(--dnd-border);
            background: rgba(156, 39, 176, 0.18);
            color: #fff;
        }
    }
}

.notes-spacer {
    flex-grow: 1;
}

@media (max-width: 700px) {
    #selection-menu {
        top: auto;
        right: 0.75rem;
        bottom: 1rem;
        width: min(22rem, calc(100vw - 1.5rem));
    }
}
</style>
