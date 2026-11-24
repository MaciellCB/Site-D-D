<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { GridType } from "../../../../core/grid";
import { uiState } from "../../../systems/ui/state";

import ResetWrapper from "./ResetWrapper.vue";
import { useLocationSettings } from "./useLocationSettings";

const props = defineProps<{ global: boolean }>();

const { t } = useI18n();

const location = computed(() => (props.global ? undefined : uiState.reactive.openedLocationSettings));

const useGrid = useLocationSettings("useGrid", location);
const gridType = useLocationSettings("gridType", location);

const unitSize = useLocationSettings("unitSize", location);
const unitSizeUnit = useLocationSettings("unitSizeUnit", location);
const dropRatio = useLocationSettings("dropRatio", location);

const gridTypes = computed(() => [
    { value: GridType.Square, label: t("game.ui.settings.GridSettings.SQUARE") },
    { value: GridType.PointyHex, label: t("game.ui.settings.GridSettings.POINTY_HEX") },
    { value: GridType.FlatHex, label: t("game.ui.settings.GridSettings.FLAT_HEX") },
]);
</script>

<template>
    <div class="panel restore-panel">
        <div class="spanrow">
            <template v-if="global">
                <em style="max-width: 40vw">
                    {{ t("game.ui.settings.common.overridden_msg") }}
                </em>
            </template>
            <template v-else>
                <i18n-t keypath="game.ui.settings.common.overridden_highlight_path" tag="span">
                    <span class="overwritten">{{ t("game.ui.settings.common.overridden_highlight") }}</span>
                </i18n-t>
            </template>
        </div>
        <ResetWrapper :global="global" :location="location" setting="useGrid">
            <label :for="'useGridInput-' + location">{{ t("game.ui.settings.GridSettings.use_grid") }}</label>
            <div>
                <input :id="'useGridInput-' + location" v-model="useGrid" type="checkbox" />
            </div>
        </ResetWrapper>
        <ResetWrapper :global="global" :location="location" setting="gridType">
            <div class="grid-type-field">
                <label :id="'gridTypeLabel-' + location" class="grid-type-label">
                    {{ t("game.ui.settings.GridSettings.grid_type") }}
                </label>
                <div class="grid-type-picker" role="radiogroup" :aria-labelledby="'gridTypeLabel-' + location">
                    <label
                        v-for="option of gridTypes"
                        :key="option.value"
                        class="grid-type-card"
                        :class="{ selected: gridType === option.value }"
                    >
                        <input v-model="gridType" type="radio" :name="'gridType-' + location" :value="option.value" />
                        <svg
                            v-if="option.value === GridType.Square"
                            class="grid-type-preview"
                            viewBox="0 0 40 36"
                            aria-hidden="true"
                        >
                            <path d="M7 5h26v26H7zM20 5v26M7 18h26" />
                        </svg>
                        <svg
                            v-else-if="option.value === GridType.PointyHex"
                            class="grid-type-preview"
                            viewBox="0 0 40 36"
                            aria-hidden="true"
                        >
                            <path
                                d="m8 3 6 3.5v7L8 17l-6-3.5v-7L8 3Zm14 0 6 3.5v7L22 17l-6-3.5v-7L22 3Zm-7 12 6 3.5v7L15 29l-6-3.5v-7l6-3.5Z"
                            />
                        </svg>
                        <svg v-else class="grid-type-preview" viewBox="0 0 40 36" aria-hidden="true">
                            <path
                                d="m2 9 4-5h8l4 5-4 5H6l-4-5Zm14 0 4-5h8l4 5-4 5h-8l-4-5Zm-7 10 4-5h8l4 5-4 5h-8l-4-5Z"
                            />
                        </svg>
                        <span>{{ option.label }}</span>
                    </label>
                </div>
            </div>
        </ResetWrapper>
        <ResetWrapper :global="global" :location="location" setting="unitSizeUnit">
            <div>
                <label :for="'unitSizeUnit-' + location">{{ t("game.ui.settings.GridSettings.size_unit") }}</label>
            </div>
            <div>
                <input :id="'unitSizeUnit-' + location" v-model="unitSizeUnit" type="text" />
            </div>
        </ResetWrapper>
        <ResetWrapper :global="global" :location="location" setting="unitSize">
            <div>
                <label :for="'unitSizeInput-' + location">
                    {{ t("game.ui.settings.GridSettings.unit_size_in_UNIT", { unit: unitSizeUnit }) }}
                </label>
            </div>
            <div>
                <input :id="'unitSizeInput-' + location" v-model.number="unitSize" type="number" step="any" />
            </div>
        </ResetWrapper>
        <ResetWrapper :global="global" :location="location" setting="dropRatio">
            <div>
                <label :for="'dropRatioInput-' + location" :title="t('game.ui.settings.GridSettings.drop_ratio_title')">
                    {{ t("game.ui.settings.GridSettings.drop_ratio") }}
                </label>
            </div>
            <div>
                <input :id="'dropRatioInput-' + location" v-model.number="dropRatio" type="number" step="any" />
            </div>
        </ResetWrapper>
    </div>
</template>

<style scoped>
/* Force higher specificity without !important abuse */
.panel.restore-panel {
    grid-template-columns: [setting] 1fr [value] auto [restore] 30px [end];
}

.panel.restore-panel .grid-type-field {
    grid-column: 1 / 3;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
    width: 100%;
}

.grid-type-label {
    color: #eee2f4;
    font-weight: 700;
}

.grid-type-picker {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.55rem;
}

.grid-type-card {
    position: relative;
    display: flex;
    min-width: 0;
    min-height: 6rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.6rem 0.4rem;
    border: 1px solid rgba(192, 132, 212, 0.24);
    border-radius: 0.7rem;
    background: rgba(255, 255, 255, 0.025);
    color: #cfc2d5;
    cursor: pointer;
    text-align: center;
    transition:
        background-color 150ms ease,
        border-color 150ms ease,
        color 150ms ease,
        transform 150ms ease;
}

.grid-type-card:hover {
    transform: translateY(-1px);
    border-color: rgba(224, 170, 255, 0.7);
    background: rgba(156, 39, 176, 0.12);
    color: #fff;
}

.grid-type-card.selected {
    border-color: #c879dc;
    background: linear-gradient(145deg, rgba(111, 32, 132, 0.44), rgba(45, 25, 55, 0.8));
    color: #fff;
    box-shadow: inset 0 0 0 1px rgba(224, 170, 255, 0.16);
}

.grid-type-card input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
}

.grid-type-card:focus-within {
    outline: 2px solid #e0aaff;
    outline-offset: 2px;
}

.grid-type-card span {
    font-size: 0.78rem;
    line-height: 1.2;
}

.grid-type-preview {
    width: 2.5rem;
    height: 2.25rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.7;
}

.overwritten,
.restore-panel .row.overwritten * {
    color: #e0aaff;
    font-weight: bold;
}

@media (max-width: 560px) {
    .grid-type-picker {
        gap: 0.35rem;
    }

    .grid-type-card {
        min-height: 5.5rem;
        padding: 0.45rem 0.25rem;
    }

    .grid-type-card span {
        font-size: 0.7rem;
    }
}
</style>
