import type {
    FloorBackgroundSet,
    FloorCreate,
    FloorRename,
    FloorTypeSet,
    FloorVisibleSet,
    FogExploredUpdate,
} from "../../../apiTypes";
import { coreStore } from "../../../store/core";
import { addServerFloor } from "../../floor/server";
import { FowLightingLayer } from "../../layers/variants/fowLighting";
import { LayerName } from "../../models/floor";
import { floorSystem } from "../../systems/floors";
import { socket } from "../socket";

socket.on("Floor.Create", async (data: FloorCreate) => {
    await addServerFloor(data.floor);
    if (data.creator === coreStore.state.username) floorSystem.selectFloor({ name: data.floor.name }, true);
});

socket.on("Floor.Remove", (name: string) => {
    floorSystem.removeFloor({ name }, false);
});

socket.on("Floor.Visible.Set", (data: FloorVisibleSet) => {
    floorSystem.setFloorPlayerVisible({ name: data.name }, data.visible, false);
});

socket.on("Floor.Rename", (data: FloorRename) => {
    floorSystem.renameFloor(data.index, data.name, false);
});

socket.on("Floors.Reorder", (floors: string[]) => floorSystem.reorderFloors(floors, false));

socket.on("Floor.Type.Set", (data: FloorTypeSet) => {
    floorSystem.setFloorType({ name: data.name }, data.floorType, false);
});

socket.on("Floor.Background.Set", (data: FloorBackgroundSet) => {
    floorSystem.setFloorBackground({ name: data.name }, data.background, false);
});

socket.on("Fog.Explored.Update", (data: FogExploredUpdate) => {
    const floor = floorSystem.getFloor({ name: data.floor });
    if (floor === undefined) {
        console.warn(`Received explored fog for unknown floor ${data.floor}`);
        return;
    }

    const layer = floorSystem.getLayer(floor, LayerName.Lighting);
    if (!(layer instanceof FowLightingLayer)) {
        console.error(`Explored fog layer is missing for floor ${data.floor}`);
        return;
    }

    layer.mergeExploredRegions(data.regions);
});
