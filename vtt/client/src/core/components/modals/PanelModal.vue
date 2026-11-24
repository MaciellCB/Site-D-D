<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { PanelTab } from "../../../game/systems/ui/types";

import Modal from "./Modal.vue";

const { tabs } = defineProps<{
    visible: boolean;
    tabs: (PanelTab & { props?: object })[];
}>();

const emit = defineEmits<{
    (e: "update:visible", visible: boolean): void;
    (e: "close"): void;
}>();

const selection = defineModel<string | undefined>("selection", { required: true });

const { t } = useI18n();

const activeTab = computed(() => {
    const tab = tabs.find((tab) => tab.id === selection.value);
    if (tab === undefined) return undefined;
    return {
        ...tab,
        props: { ...tab.props, tabSelected: computed(() => tab.id === selection.value) },
    };
});

function setSelection(id: string): void {
    selection.value = id;
}

function hideModal(): void {
    emit("update:visible", false);
    emit("close");
}
</script>

<template>
    <Modal :visible="visible" :colour="'#120e18'" :mask="false">
        <template #header="m">
            <div class="modal-header" draggable="true" @dragstart="m.dragStart" @dragend="m.dragEnd">
                <div><slot name="title"></slot></div>
                <div class="header-close" :title="t('common.close')" @click.stop="hideModal">
                    <font-awesome-icon :icon="['far', 'window-close']" />
                </div>
            </div>
        </template>
        <div class="modal-body">
            <div id="categories">
                <div
                    v-for="tab of tabs"
                    :key="tab.id"
                    class="category"
                    :class="{ selected: tab.id === selection }"
                    @click="setSelection(tab.id)"
                >
                    {{ tab.label }}
                </div>
            </div>
            <div style="display: flex; flex-direction: column">
                <template v-if="activeTab">
                    <KeepAlive>
                        <component :is="activeTab.component" v-bind="activeTab.props" @close="hideModal" />
                    </KeepAlive>
                </template>
            </div>
        </div>
    </Modal>
</template>

<style scoped lang="scss">
.modal-header {
    position: relative;
    padding: 0.85rem 2.5rem 0.85rem 1rem;
    border-bottom: 1px solid rgba(192, 132, 212, 0.24);
    border-radius: 0.85rem 0.85rem 0 0;
    background: linear-gradient(110deg, #32183e, #1a1321);
    color: #f5eafa;
    font-size: 1.05rem;
    font-weight: bold;
    cursor: move;
}

.header-close {
    position: absolute;
    top: 5px;
    right: 5px;
}

.modal-body {
    display: flex;
    flex-direction: row;
    max-height: min(78vh, 760px);
    overflow: auto;
    background: #120e18;
    color: #eee3f3;
}

* {
    box-sizing: border-box;
}

#categories {
    width: 10rem;
    flex: 0 0 10rem;
    padding: 0.6rem;
    border-right: 1px solid rgba(192, 132, 212, 0.18);
    background: #0e0b13;
}

.category {
    margin: 0.2rem 0;
    padding: 0.65rem 0.75rem;
    border: 1px solid transparent;
    border-radius: 0.5rem;
    color: #bfb0c6;
    text-align: left;
    transition:
        background-color 150ms ease,
        border-color 150ms ease,
        color 150ms ease;
}

.selected,
.category:hover {
    border-color: rgba(192, 132, 212, 0.28);
    background: rgba(156, 39, 176, 0.2);
    color: #fff;
    cursor: pointer;
    font-weight: 700;
}

:deep() {
    @layer base-modals {
        .panel {
            min-width: 24rem;
            padding: 1.1rem;
            border: 1px solid rgba(192, 132, 212, 0.14);
            border-radius: 0 0 0.85rem 0;
            background: #17111f;
            color: #eee3f3;
            display: grid;
            grid-template-columns: [setting] minmax(10rem, 1fr) [value] minmax(8rem, 1fr) [end];
            align-content: start;
            min-height: 10em;

            button {
                padding: 0.55rem 0.8rem;
                border: 1px solid rgba(192, 132, 212, 0.3);
                border-radius: 0.45rem;
                background: #251a2d;
                color: #f2e7f6;
                transition:
                    background-color 150ms ease,
                    border-color 150ms ease;
            }

            button:hover {
                border-color: #c879dc;
                background: #382044;
            }

            select,
            input[type="text"],
            input[type="number"],
            textarea {
                min-height: 2.3rem;
                padding: 0.45rem 0.6rem;
                border: 1px solid rgba(192, 132, 212, 0.24);
                border-radius: 0.4rem;
                background: #0d0a11;
                color: #f4edf8;
            }

            select:focus,
            input[type="text"]:focus,
            input[type="number"]:focus,
            textarea:focus {
                border-color: #c879dc;
                outline: 2px solid rgba(156, 39, 176, 0.24);
            }

            input[type="checkbox"],
            input[type="radio"] {
                accent-color: #9c27b0;
            }

            input[type="number"],
            input[type="text"] {
                width: 100%;
            }
        }

        .row {
            display: contents;

            &:first-of-type > * {
                margin-top: 0.5em;
            }

            &:last-of-type > * {
                margin-bottom: 0.5em;
            }

            &:hover > * {
                cursor: pointer;
                text-shadow: 0px 0px 1px black;
            }
        }

        .row > *,
        .panel > *:not(.row) {
            display: flex;
            /* justify-content: center; */
            align-items: center;
            margin: 0.4em 0;
        }

        .smallrow > * {
            padding: 0.2em;
        }

        .header {
            line-height: 0.1em;
            margin: 20px 0 15px;
            font-style: italic;
            overflow: hidden;
            padding: 0.5em;

            &:after {
                position: relative;
                width: 100%;
                border-bottom: 1px solid rgba(224, 170, 255, 0.3);
                content: "";
                margin-right: -100%;
                margin-left: 10px;
                display: inline-block;
            }
        }

        .danger {
            color: #ff7052;

            &:hover {
                text-shadow: 0px 0px 1px #ff7052;
                cursor: pointer;
            }
        }

        .spanrow {
            grid-column: 1 / end;
            justify-self: normal;
            font-weight: bold;
        }

        input[type="checkbox"] {
            width: 16px;
            height: 23px;
            margin: 0;
            white-space: nowrap;
            display: inline-block;
        }

        .color-picker {
            margin: 0.5em 0 !important;
        }
    }
}
</style>
