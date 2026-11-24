<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import ColourPicker from "../../../core/components/ColourPicker.vue";
import { GridType } from "../../../core/grid";
import { baseAdjust } from "../../../core/http";
import { locationSettingsState } from "../../systems/settings/location/state";
import { SpellShape, spellTool } from "../../tools/variants/spell";

const { t } = useI18n();

const selected = spellTool.isActiveTool;

const isHexGrid = computed(() => locationSettingsState.reactive.gridType.value !== GridType.Square);

const shapes = computed(() => [
    SpellShape.Square,
    SpellShape.Circle,
    SpellShape.Cone,
    ...(isHexGrid.value ? [SpellShape.Hex] : []),
]);

const sizeUnit = computed(() => locationSettingsState.reactive.unitSizeUnit.value);

const stepSize = computed(() => {
    if (isHexGrid.value && spellTool.state.selectedSpellShape === SpellShape.Hex) {
        return 1;
    }
    return 5;
});

function selectShape(shape: SpellShape): void {
    spellTool.state.selectedSpellShape = shape;
    spellTool.drawShape();
}

function shapeLabel(shape: SpellShape): string {
    switch (shape) {
        case SpellShape.Square:
            return t("game.ui.tools.DrawTool.square");
        case SpellShape.Circle:
            return t("game.ui.tools.DrawTool.circle");
        case SpellShape.Cone:
            return t("game.ui.tools.DrawTool.cone");
        case SpellShape.Hex:
            return t("game.ui.tools.SpellTool.hexagon");
    }
}
</script>

<template>
    <div v-if="selected" class="tool-detail">
        <div class="spell-tool">
            <header class="spell-tool-header">
                <strong>{{ t("game.ui.tools.SpellTool.area_title") }}</strong>
                <span>
                    {{
                        spellTool.state.isEditing
                            ? t("game.ui.tools.SpellTool.edit_instructions")
                            : t("game.ui.tools.SpellTool.instructions")
                    }}
                </span>
            </header>
            <div class="selectgroup" role="group" :aria-label="t('game.ui.tools.SpellTool.shape')">
                <button
                    v-for="shape in shapes"
                    :key="shape"
                    type="button"
                    class="option"
                    :class="{ 'option-selected': spellTool.state.selectedSpellShape === shape }"
                    :aria-pressed="spellTool.state.selectedSpellShape === shape"
                    :disabled="spellTool.state.isEditing && spellTool.state.selectedSpellShape !== shape"
                    :title="shapeLabel(shape)"
                    @click="selectShape(shape)"
                >
                    <font-awesome-icon v-if="shape !== SpellShape.Cone && shape !== SpellShape.Hex" :icon="shape" />
                    <img v-else-if="shape === SpellShape.Cone" :src="baseAdjust('static/img/cone.svg')" alt="" />
                    <span v-else class="shape-hex-icon" aria-hidden="true"></span>
                    <span>{{ shapeLabel(shape) }}</span>
                </button>
            </div>
            <div id="grid">
                <label for="size">{{ t("game.ui.tools.SpellTool.size") }}</label>
                <div class="spell-input-with-unit">
                    <input id="size" v-model.number="spellTool.state.size" type="number" min="1" :step="stepSize" />
                    <span>{{ sizeUnit }}</span>
                </div>
                <template v-if="isHexGrid">
                    <label for="oddHexOrientation">{{ t("game.ui.tools.SpellTool.alternate_hexes") }}</label>
                    <input
                        id="oddHexOrientation"
                        v-model="spellTool.state.oddHexOrientation"
                        type="checkbox"
                        :disabled="spellTool.state.isEditing"
                    />
                </template>
                <label for="colour">{{ t("common.fill_color") }}</label>
                <ColourPicker
                    id="colour"
                    v-model:colour="spellTool.state.colour"
                    class="colour-option"
                    :title="t('game.ui.tools.DrawTool.background_color')"
                />
                <label for="public">{{ t("game.ui.tools.SpellTool.show_publicly") }}</label>
                <button
                    id="public"
                    type="button"
                    class="slider-checkbox"
                    :aria-pressed="spellTool.state.showPublic"
                    @click="spellTool.state.showPublic = !spellTool.state.showPublic"
                ></button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.spell-tool {
    display: grid;
    gap: 0.85rem;
    min-width: 17rem;
}

.spell-tool-header {
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

.option {
    display: flex;
    min-height: 3.2rem;
    flex: 1 1 0;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.5rem 0.35rem;
    border: 1px solid rgba(192, 132, 212, 0.25);
    border-radius: 0.55rem;
    background: rgba(255, 255, 255, 0.025);
    color: #cfc2d5;
    cursor: pointer;
    font: inherit;
    font-size: 0.72rem;
    line-height: 1;
    text-align: center;

    &:hover {
        border-color: #c879dc;
        background: rgba(156, 39, 176, 0.16);
        color: #fff;
    }

    > svg,
    > img,
    > .shape-hex-icon {
        width: 1.15rem;
        height: 1.15rem;
        align-self: center;
        object-fit: contain;
    }
}

.shape-hex-icon {
    clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
    background: currentColor;
}

.option-selected {
    border-color: rgba(224, 170, 255, 0.68);
    background: linear-gradient(145deg, rgba(126, 35, 148, 0.55), rgba(61, 29, 74, 0.68));
    color: #fff;
    box-shadow: inset 0 -2px #c9ad6a;
}

.option:disabled {
    cursor: not-allowed;
    opacity: 0.45;
}

.selectgroup {
    display: flex;
    gap: 0.4rem;
}

#grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(5rem, auto);
    row-gap: 0.65rem;
    column-gap: 0.8rem;
    align-items: center;

    label {
        color: #d7cbdc;
        font-size: 0.8rem;
    }

    input[type="checkbox"] {
        width: 1rem;
        justify-self: end;
        accent-color: #9c27b0;
    }
}

.spell-input-with-unit {
    display: flex;
    align-items: center;
    gap: 0.45rem;

    input {
        width: 5rem;
    }

    span {
        color: #aa99b1;
        font-size: 0.75rem;
    }
}

.colour-option {
    justify-self: end;
}

@media (max-width: 520px) {
    .spell-tool {
        min-width: 0;
    }
}
</style>
