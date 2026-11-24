<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import ColourPicker from "../../../core/components/ColourPicker.vue";
import { LightMode, lightTool } from "../../tools/variants/light";

const { t } = useI18n();

const selected = lightTool.isActiveTool;

const modes = computed(() => [
    { value: LightMode.PointLight, label: t("game.ui.tools.LightTool.point"), icon: "lightbulb" },
    { value: LightMode.Ambient, label: t("game.ui.tools.LightTool.ambient"), icon: "sun" },
    { value: LightMode.Barrier, label: t("game.ui.tools.LightTool.barrier"), icon: "road-barrier" },
]);

function selectMode(mode: LightMode): void {
    lightTool.state.mode = mode;
}

function syncEditToAura(): void {
    lightTool.updateSelectedLightAura();
}

function onEditColourChange(colour: string): void {
    lightTool.state.pointLight.edit.colour = colour;
    syncEditToAura();
}
</script>

<template>
    <div v-if="selected" class="tool-detail light-tool">
        <header class="light-header">
            <strong>{{ $t("game.ui.tools.LightTool.title") }}</strong>
            <span>{{ $t("game.ui.tools.LightTool.description") }}</span>
        </header>
        <div class="interaction-toggle">
            <button
                type="button"
                class="interaction-btn"
                :class="{ 'interaction-active': lightTool.state.interactionMode === 'place' }"
                :aria-pressed="lightTool.state.interactionMode === 'place'"
                @click="lightTool.setInteractionMode('place')"
            >
                <font-awesome-icon icon="plus" />
                <span>{{ $t("game.ui.tools.LightTool.place") }}</span>
            </button>
            <button
                type="button"
                class="interaction-btn"
                :class="{ 'interaction-active': lightTool.state.interactionMode === 'edit' }"
                :aria-pressed="lightTool.state.interactionMode === 'edit'"
                @click="lightTool.setInteractionMode('edit')"
            >
                <font-awesome-icon icon="pencil-alt" />
                <span>{{ $t("game.ui.tools.LightTool.edit") }}</span>
            </button>
        </div>

        <template v-if="lightTool.state.interactionMode === 'place'">
            <div class="light-modes">
                <button
                    v-for="mode in modes"
                    :key="mode.value"
                    type="button"
                    class="light-mode-tab"
                    :class="{ 'light-mode-active': lightTool.state.mode === mode.value }"
                    :aria-pressed="lightTool.state.mode === mode.value"
                    :title="mode.label"
                    @click="selectMode(mode.value)"
                >
                    <font-awesome-icon :icon="mode.icon" />
                    <span>{{ mode.label }}</span>
                </button>
            </div>

            <template v-if="lightTool.state.mode === LightMode.PointLight">
                <div class="light-row">
                    <label for="light-bright">{{ $t("game.ui.tools.LightTool.bright_radius") }}</label>
                    <input
                        id="light-bright"
                        v-model.number="lightTool.state.pointLight.create.brightRadius"
                        type="number"
                        min="0"
                        step="1"
                    />
                </div>
                <div class="light-row">
                    <label for="light-dim">{{ $t("game.ui.tools.LightTool.dim_radius") }}</label>
                    <input
                        id="light-dim"
                        v-model.number="lightTool.state.pointLight.create.dimRadius"
                        type="number"
                        min="0"
                        step="1"
                    />
                </div>
                <div class="light-row">
                    <label for="light-angle">{{ $t("game.ui.tools.LightTool.angle") }}</label>
                    <input
                        id="light-angle"
                        v-model.number="lightTool.state.pointLight.create.angle"
                        type="number"
                        min="0"
                        max="360"
                        step="5"
                    />
                </div>
                <div class="light-row">
                    <label>{{ $t("game.ui.tools.LightTool.colour") }}</label>
                    <ColourPicker v-model:colour="lightTool.state.pointLight.create.colour" />
                </div>
                <div class="light-hint">{{ $t("game.ui.tools.LightTool.click_to_place") }}</div>
            </template>

            <template v-else-if="lightTool.state.mode === LightMode.Ambient">
                <div class="light-hint">
                    {{ $t("game.ui.tools.LightTool.ambient_light_hint") }}
                </div>
                <div class="light-hint">{{ $t("game.ui.tools.LightTool.click_to_place_ambient") }}</div>
            </template>

            <template v-else-if="lightTool.state.mode === LightMode.Barrier">
                <div class="barrier-stepper">
                    <div
                        class="barrier-step"
                        :class="{
                            'step-active': !lightTool.state.barrierActive,
                            'step-completed': lightTool.state.barrierActive,
                        }"
                    >
                        <span class="step-indicator">
                            <font-awesome-icon v-if="lightTool.state.barrierActive" icon="check-circle" />
                            <span v-else>1</span>
                        </span>
                        <span class="step-label">{{ $t("game.ui.tools.LightTool.click_on_highlighted_vertex") }}</span>
                    </div>
                    <div class="barrier-step" :class="{ 'step-active': lightTool.state.barrierActive }">
                        <span class="step-indicator">2</span>
                        <span class="step-label">{{ $t("game.ui.tools.LightTool.add_extra_points") }}</span>
                    </div>
                    <div class="barrier-step" :class="{ 'step-active': lightTool.state.barrierActive }">
                        <span class="step-indicator">3</span>
                        <span class="step-label">{{
                            $t("game.ui.tools.LightTool.click_highlighted_point_to_close")
                        }}</span>
                    </div>
                </div>
                <div class="light-hint">
                    <template v-if="lightTool.state.barrierActive">
                        {{ $t("game.ui.tools.LightTool.press_escape_to_cancel") }}
                    </template>
                    <template v-else> {{ $t("game.ui.tools.LightTool.define_natural_barriers") }} </template>
                </div>
            </template>
        </template>

        <template v-else>
            <template v-if="lightTool.state.selectedShape !== undefined">
                <template v-if="lightTool.state.selectedShapeMode === LightMode.PointLight">
                    <div class="light-row">
                        <label for="edit-bright">{{ $t("game.ui.tools.LightTool.bright_radius") }}</label>
                        <input
                            id="edit-bright"
                            v-model.number="lightTool.state.pointLight.edit.brightRadius"
                            type="number"
                            min="0"
                            step="1"
                            @change="syncEditToAura"
                        />
                    </div>
                    <div class="light-row">
                        <label for="edit-dim">{{ $t("game.ui.tools.LightTool.dim_radius") }}</label>
                        <input
                            id="edit-dim"
                            v-model.number="lightTool.state.pointLight.edit.dimRadius"
                            type="number"
                            min="0"
                            step="1"
                            @change="syncEditToAura"
                        />
                    </div>
                    <div class="light-row">
                        <label for="edit-angle">{{ $t("game.ui.tools.LightTool.angle") }}</label>
                        <input
                            id="edit-angle"
                            v-model.number="lightTool.state.pointLight.edit.angle"
                            type="number"
                            min="0"
                            max="360"
                            step="5"
                            @change="syncEditToAura"
                        />
                    </div>
                    <div class="light-row">
                        <label>{{ $t("game.ui.tools.LightTool.colour") }}</label>
                        <ColourPicker
                            :colour="lightTool.state.pointLight.edit.colour"
                            @update:colour="onEditColourChange"
                        />
                    </div>
                </template>
                <button type="button" class="light-delete-btn" @click="lightTool.deleteShape()">
                    <font-awesome-icon icon="trash-alt" />
                    {{ $t("game.ui.tools.LightTool.delete_light") }}
                </button>
            </template>
            <div v-else class="light-hint">{{ $t("game.ui.tools.LightTool.click_light_on_map_to_select") }}</div>
        </template>
    </div>
</template>

<style scoped lang="scss">
.light-header {
    display: grid;
    gap: 0.25rem;

    strong {
        color: #f5eafa;
        font-size: 0.95rem;
    }

    span {
        color: #b6a8bb;
        font-size: 0.78rem;
        line-height: 1.4;
    }
}

.light-tool {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    width: min(22rem, calc(100vw - 19rem));
}

.interaction-toggle {
    display: flex;
    gap: 0.4rem;

    .interaction-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.55rem 0.45rem;
        cursor: pointer;
        border: 1px solid rgba(192, 132, 212, 0.25);
        border-radius: 0.55rem;
        background: rgba(255, 255, 255, 0.025);
        color: #cfc2d5;
        font: inherit;
        font-size: 0.78rem;
        font-weight: 650;

        &:first-child {
            border-radius: 0.55rem;
        }

        &:last-child {
            border-radius: 0.55rem;
        }

        &:hover {
            border-color: #c879dc;
            background: rgba(156, 39, 176, 0.16);
            color: #fff;
        }

        svg {
            font-size: 12px;
        }
    }

    .interaction-active {
        border-color: rgba(224, 170, 255, 0.65);
        background: linear-gradient(145deg, #76228b, #461252);
        color: #fff;
        box-shadow: inset 0 -2px #c9ad6a;
    }
}

.light-modes {
    display: flex;
    gap: 0.4rem;

    .light-mode-tab {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
        padding: 0.6rem 0.35rem;
        cursor: pointer;
        border: 1px solid rgba(192, 132, 212, 0.25);
        border-radius: 0.55rem;
        background: rgba(255, 255, 255, 0.025);
        color: #cfc2d5;
        font: inherit;
        font-size: 0.72rem;

        &:first-child {
            border-radius: 0.55rem;
        }

        &:last-child {
            border-radius: 0.55rem;
        }

        &:hover {
            border-color: #c879dc;
            background: rgba(156, 39, 176, 0.16);
            color: #fff;
        }

        svg {
            font-size: 1rem;
        }
    }

    .light-mode-active {
        border-color: rgba(224, 170, 255, 0.65);
        background: linear-gradient(145deg, rgba(126, 35, 148, 0.55), rgba(61, 29, 74, 0.68));
        color: #fff;
        box-shadow: inset 0 -2px #c9ad6a;
    }
}

.light-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    color: #d7cbdc;
    font-size: 0.8rem;

    label {
        white-space: nowrap;
    }

    input[type="number"] {
        width: 5rem;
        flex: 0 0 5rem;
        padding: 0.35rem 0.45rem;
    }
}

.light-hint {
    padding: 0.55rem 0.65rem;
    border-radius: 0.45rem;
    background: rgba(255, 255, 255, 0.035);
    color: #b6a8bb;
    font-size: 0.76rem;
    line-height: 1.4;
}

.barrier-stepper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.barrier-step {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.35rem 0.45rem;
    border-radius: 0.4rem;
    color: #82768a;
    font-size: 0.78rem;
    transition: all 0.15s ease;

    .step-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.35rem;
        height: 1.35rem;
        border-radius: 50%;
        border: 1.5px solid #82768a;
        font-size: 0.72rem;
        font-weight: 600;
        flex-shrink: 0;
    }

    .step-label {
        em {
            font-weight: normal;
        }
    }

    &.step-active {
        color: #f4edf8;

        .step-indicator {
            border-color: #e0aaff;
            color: #e0aaff;
            background-color: rgba(156, 39, 176, 0.15);
        }
    }

    &.step-completed {
        color: #c9ad6a;

        .step-indicator {
            border-color: #c9ad6a;
            color: #c9ad6a;
            font-size: 0.85rem;
        }
    }
}

.light-delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 0.25rem;
    padding: 0.55rem 0;
    width: 100%;
    background: rgba(221, 102, 102, 0.06);
    border: 1px solid rgba(221, 102, 102, 0.6);
    border-radius: 0.5rem;
    color: #ffaaaa;
    cursor: pointer;
    font: inherit;
    font-size: 0.78rem;

    &:hover {
        background-color: rgba(221, 102, 102, 0.16);
    }
}

@media (max-width: 700px) {
    .light-tool {
        width: min(22rem, calc(100vw - 1.5rem));
    }
}
</style>
