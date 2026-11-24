import type { MaybeRef, Raw } from "vue";

import type { Section } from "../../../core/components/contextMenu/types";
import type { LocalId } from "../../../core/id";
import { buildState } from "../../../core/systems/state";
import type { FloorId } from "../../models/floor";
import { ClientSettingCategory } from "../../ui/settings/client/categories";
import { ShapeSettingCategory } from "../../ui/settings/shape/categories";

import type { PanelTab } from "./types";

interface UiState {
    showUi: boolean;
    presentationMode: boolean;

    annotationText: string;

    showClientSettings: boolean;
    clientSettingsTab: string;

    showDmSettings: boolean;

    openedLocationSettings: number;

    showFloorSettings: boolean;
    selectedFloor: FloorId;

    preventContextMenu: boolean;

    activeShapeTab: ShapeSettingCategory;

    // MOD interactions
    characterTabs: Raw<{
        tab: PanelTab;
        filter?: MaybeRef<(shape: LocalId, hasEditAccess: boolean) => boolean>;
    }>[];
    shapeContextMenuEntries: Raw<MaybeRef<(shape: LocalId) => Section[]>>[];
}

const presentationMode = new URLSearchParams(window.location.search).get("presentation") === "1";

const state = buildState<UiState>({
    showUi: !presentationMode,
    presentationMode,

    annotationText: "",

    showClientSettings: false,
    clientSettingsTab: ClientSettingCategory.Appearance,

    showDmSettings: false,

    openedLocationSettings: -1,

    showFloorSettings: false,
    selectedFloor: 0 as FloorId,

    preventContextMenu: false,

    activeShapeTab: ShapeSettingCategory.Properties,

    // MODS
    characterTabs: [],
    shapeContextMenuEntries: [],
});

export const uiState = {
    ...state,
};
