import tinycolor from "tinycolor2";
import { reactive, watch } from "vue";

import { g2l, getUnitDistance, l2g, toRadians } from "../../../core/conversions";
import { toGP } from "../../../core/geometry";
import type { GlobalPoint, LocalPoint } from "../../../core/geometry";
import { DEFAULT_HEX_RADIUS, getClosestCellCenter, GridType } from "../../../core/grid";
import { InvalidationMode, NO_SYNC, SyncMode, UI_SYNC } from "../../../core/models/types";
import { i18n } from "../../../i18n";
import { sendShapePositionUpdate, sendShapeSizeUpdate } from "../../api/emits/shape/core";
import type { ILayer } from "../../interfaces/layer";
import type { IShape } from "../../interfaces/shape";
import type { ShapeOptions } from "../../models/shapes";
import { ToolName } from "../../models/tools";
import type { ITool, ToolPermission } from "../../models/tools";
import { Circle } from "../../shapes/variants/circle";
import { createHexPolygon } from "../../shapes/variants/hex";
import { Polygon } from "../../shapes/variants/polygon";
import { Rect } from "../../shapes/variants/rect";
import { accessSystem } from "../../systems/access";
import { floorState } from "../../systems/floors/state";
import { playerSystem } from "../../systems/players";
import { propertiesSystem } from "../../systems/properties";
import { getProperties } from "../../systems/properties/state";
import { locationSettingsState } from "../../systems/settings/location/state";
import { SelectFeatures } from "../models/select";
import { Tool } from "../tool";
import { activateTool } from "../tools";

type SpellAreaOptions = NonNullable<ShapeOptions["spellArea"]>;

interface SpellEditSnapshot {
    refPoint: GlobalPoint;
    center: GlobalPoint;
    angle: number;
    radius?: number;
    width?: number;
    height?: number;
    vertices?: GlobalPoint[];
    spellArea: SpellAreaOptions;
    fillColour: string;
    strokeColour: string[];
    isInvisible: boolean;
}

export const SpellShape = {
    Square: "square",
    Circle: "circle",
    Cone: "cone",
    Hex: "hex",
} as const;

export type SpellShape = (typeof SpellShape)[keyof typeof SpellShape];

class SpellTool extends Tool implements ITool {
    readonly toolName = ToolName.Spell;
    readonly toolTranslation = i18n.global.t("tool.Spell");

    shape?: IShape;

    state = reactive<{
        selectedSpellShape: SpellShape;
        showPublic: boolean;
        oddHexOrientation: boolean;
        isEditing: boolean;
        colour: string;
        size: number;
    }>({
        selectedSpellShape: SpellShape.Square,
        showPublic: true,
        oddHexOrientation: false,
        isEditing: false,

        colour: "rgb(63, 127, 191)",
        size: 5,
    });

    private dragging = false;
    private editSnapshot?: SpellEditSnapshot;
    private appliedSize = 0;
    private aimStart?: GlobalPoint;
    private aimEnd?: GlobalPoint;
    private aimLayer?: ILayer;

    private readonly drawAimGuide = (ctx: CanvasRenderingContext2D): void => {
        if (this.aimStart === undefined || this.aimEnd === undefined) return;

        const start = g2l(this.aimStart);
        const end = g2l(this.aimEnd);
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const arrowLength = 8;

        ctx.save();
        ctx.strokeStyle = this.state.colour;
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
            end.x - arrowLength * Math.cos(angle - Math.PI / 6),
            end.y - arrowLength * Math.sin(angle - Math.PI / 6),
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
            end.x - arrowLength * Math.cos(angle + Math.PI / 6),
            end.y - arrowLength * Math.sin(angle + Math.PI / 6),
        );
        ctx.stroke();
        ctx.restore();
    };

    get permittedTools(): ToolPermission[] {
        return [
            {
                name: ToolName.Select,
                features: { enabled: [SelectFeatures.Context] },
            },
        ];
    }

    constructor() {
        super();
        watch(
            () => this.state.size,
            () => {
                if (this.shape !== undefined) this.drawShape();
            },
        );
        watch(
            () => this.state.oddHexOrientation,
            () => {
                if (this.shape !== undefined) this.drawShape();
            },
        );
        watch(
            () => this.state.selectedSpellShape,
            () => {
                if (this.shape !== undefined) this.drawShape();
            },
        );
        watch(
            () => this.state.colour,
            () => {
                if (this.shape !== undefined) this.drawShape();
            },
        );
        watch(
            () => this.state.showPublic,
            () => {
                if (this.shape !== undefined) this.drawShape(true);
            },
        );
    }

    drawShape(syncChanged = false): void {
        if (this.shape === undefined || this.state.size <= 0) return;

        if (this.state.isEditing) {
            const originalShape = this.editSnapshot?.spellArea.shape;
            if (originalShape !== undefined && this.state.selectedSpellShape !== originalShape) {
                this.state.selectedSpellShape = originalShape;
                return;
            }
            this.applyEditSettings();
            return;
        }

        const layer = floorState.currentLayer.value!;
        const center = this.shape.center;
        const angle = this.shape.angle;
        const oldShape = this.shape;
        const syncMode = this.state.showPublic !== syncChanged ? SyncMode.TEMP_SYNC : SyncMode.NO_SYNC;
        layer.removeShape(oldShape, { sync: syncMode, recalculate: false, dropShapeId: true });

        this.shape = this.createShape(center);
        this.shape.angle = angle;
        this.applyAppearance();
        this.grantEditAccess();
        layer.addShape(
            this.shape,
            this.state.showPublic ? SyncMode.TEMP_SYNC : SyncMode.NO_SYNC,
            InvalidationMode.NORMAL,
        );
    }

    private createShape(center: GlobalPoint): IShape {
        switch (this.state.selectedSpellShape) {
            case SpellShape.Circle:
                return new Circle(center, getUnitDistance(this.state.size), { isSnappable: false });
            case SpellShape.Square: {
                const sideLength = getUnitDistance(this.state.size);
                const shape = new Rect(center, sideLength, sideLength, { isSnappable: false });
                shape.center = center;
                return shape;
            }
            case SpellShape.Cone:
                return new Circle(center, getUnitDistance(this.state.size), {
                    viewingAngle: toRadians(60),
                    isSnappable: false,
                });
            case SpellShape.Hex:
                return createHexPolygon(
                    center,
                    this.state.size,
                    {
                        type: locationSettingsState.raw.gridType.value,
                        oddHexOrientation: this.state.oddHexOrientation,
                        radius: DEFAULT_HEX_RADIUS,
                    },
                    { isSnappable: false },
                );
            default:
                throw new Error("Unsupported spell shape: " + this.state.selectedSpellShape);
        }
    }

    private applyAppearance(): void {
        if (this.shape === undefined) return;

        const fill = tinycolor(this.state.colour);
        fill.setAlpha(fill.getAlpha() * 0.7);
        propertiesSystem.setFillColour(this.shape.id, fill.toRgbString(), NO_SYNC);
        propertiesSystem.setStrokeColour(this.shape.id, this.state.colour, NO_SYNC);
        this.shape.options.spellArea = this.getSpellAreaOptions();
    }

    private grantEditAccess(): void {
        if (this.shape === undefined) return;

        accessSystem.addAccess(
            this.shape.id,
            playerSystem.getCurrentPlayer()!.name,
            { edit: true, movement: true, vision: false },
            UI_SYNC,
        );
    }

    onSelect(): Promise<void> {
        if (
            locationSettingsState.raw.gridType.value === GridType.Square &&
            this.state.selectedSpellShape === SpellShape.Hex
        ) {
            this.state.selectedSpellShape = SpellShape.Square;
        }
        return Promise.resolve();
    }

    async onDeselect(): Promise<void> {
        await this.close({ dropShapeId: true, deselectTool: false });
    }

    async onDown(lp: LocalPoint, event: MouseEvent | TouchEvent | undefined): Promise<void> {
        const point = this.snapToGrid(l2g(lp));
        const clickCount = event !== undefined && "detail" in event ? event.detail : 1;
        const existingSpell = this.findSpellAt(point);

        if (this.state.isEditing) {
            await this.close({ dropShapeId: false, deselectTool: false });
            return;
        }

        if (clickCount > 1) {
            if (existingSpell !== undefined) this.beginEdit(existingSpell, point);
            return;
        }

        if (existingSpell !== undefined || this.shape !== undefined) return;

        this.dragging = true;
        this.shape = this.createShape(point);
        this.applyAppearance();
        this.grantEditAccess();
        floorState.currentLayer.value!.addShape(
            this.shape,
            this.state.showPublic ? SyncMode.TEMP_SYNC : SyncMode.NO_SYNC,
            InvalidationMode.NORMAL,
        );
        this.startAimGuide(point, point);
    }

    onUp(): Promise<void> {
        if (!this.dragging) return Promise.resolve();
        this.dragging = false;
        return this.close({ dropShapeId: false, deselectTool: false });
    }

    onMove(lp: LocalPoint): Promise<void> {
        if (this.shape === undefined) return Promise.resolve();

        const endPoint = this.snapToGrid(l2g(lp));
        const layer = floorState.currentLayer.value!;
        this.updateAimGuide(endPoint);

        if (this.state.selectedSpellShape === SpellShape.Cone) {
            const center = g2l(this.shape.center);
            this.shape.angle = -Math.atan2(lp.y - center.y, center.x - lp.x) + Math.PI;
        } else {
            this.shape.center = endPoint;
        }

        if (this.state.showPublic) sendShapePositionUpdate([this.shape], true);
        layer.invalidate(true);
        return Promise.resolve();
    }

    private snapToGrid(point: GlobalPoint): GlobalPoint {
        return getClosestCellCenter(point, locationSettingsState.raw.gridType.value);
    }

    private findSpellAt(point: GlobalPoint): IShape | undefined {
        const layer = floorState.currentLayer.value;
        if (layer === undefined) return undefined;

        const shapes = layer.getShapes({ onlyInView: true });
        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i]!;
            if (shape.options.spellArea === undefined || !shape.contains(point)) continue;
            if (!accessSystem.hasAccessTo(shape.id, "edit")) continue;
            return shape;
        }
        return undefined;
    }

    private beginEdit(shape: IShape, point: GlobalPoint): void {
        const metadata = shape.options.spellArea;
        if (metadata === undefined) return;

        const properties = getProperties(shape.id)!;
        this.editSnapshot = {
            refPoint: toGP(shape.refPoint.x, shape.refPoint.y),
            center: toGP(shape.center.x, shape.center.y),
            angle: shape.angle,
            ...(shape instanceof Circle ? { radius: shape.r } : {}),
            ...(shape instanceof Rect ? { width: shape.w, height: shape.h } : {}),
            ...(shape instanceof Polygon ? { vertices: shape.vertices.map((vertex) => toGP(vertex.x, vertex.y)) } : {}),
            spellArea: { ...metadata },
            fillColour: properties.fillColour,
            strokeColour: [...properties.strokeColour],
            isInvisible: properties.isInvisible,
        };

        this.shape = shape;
        this.appliedSize = metadata.size;
        this.state.selectedSpellShape = metadata.shape;
        this.state.size = metadata.size;
        this.state.colour = metadata.colour;
        this.state.showPublic = metadata.showPublic;
        this.state.oddHexOrientation = metadata.oddHexOrientation;
        this.state.isEditing = true;
        propertiesSystem.setIsInvisible(shape.id, false, NO_SYNC);
        this.startAimGuide(shape.center, point);
    }

    private applyEditSettings(): void {
        if (this.shape === undefined || this.editSnapshot === undefined || this.state.size <= 0) return;

        const center = this.shape.center;
        if (this.shape instanceof Circle) {
            this.shape.r = getUnitDistance(this.state.size);
            this.shape.viewingAngle = this.state.selectedSpellShape === SpellShape.Cone ? toRadians(60) : null;
        } else if (this.shape instanceof Rect) {
            const sideLength = getUnitDistance(this.state.size);
            this.shape.w = sideLength;
            this.shape.h = sideLength;
            this.shape.center = center;
        } else if (this.shape instanceof Polygon && this.appliedSize > 0) {
            const scale = this.state.size / this.appliedSize;
            this.shape.vertices = this.shape.vertices.map((vertex) =>
                toGP(center.x + (vertex.x - center.x) * scale, center.y + (vertex.y - center.y) * scale),
            );
        }

        this.appliedSize = this.state.size;
        this.applyAppearance();
        if (this.state.showPublic) sendShapeSizeUpdate({ shape: this.shape, temporary: true });
        this.shape.layer?.invalidate(true);
    }

    private getSpellAreaOptions(): SpellAreaOptions {
        return {
            shape: this.state.selectedSpellShape,
            size: this.state.size,
            colour: this.state.colour,
            showPublic: this.state.showPublic,
            oddHexOrientation: this.state.oddHexOrientation,
        };
    }

    private startAimGuide(start: GlobalPoint, end: GlobalPoint): void {
        this.aimStart = start;
        this.aimEnd = end;
        this.aimLayer = this.shape?.layer;
        this.aimLayer?.registerDrawCallback(this.drawAimGuide);
        this.aimLayer?.invalidate(true);
    }

    private updateAimGuide(end: GlobalPoint): void {
        this.aimEnd = end;
        this.aimLayer?.invalidate(true);
    }

    private stopAimGuide(): void {
        this.aimLayer?.unregisterDrawCallback(this.drawAimGuide);
        this.aimLayer?.invalidate(true);
        this.aimLayer = undefined;
        this.aimStart = undefined;
        this.aimEnd = undefined;
    }

    private restoreEditSnapshot(): void {
        if (this.shape === undefined || this.editSnapshot === undefined) return;
        const snapshot = this.editSnapshot;

        this.shape.refPoint = snapshot.refPoint;
        this.shape.angle = snapshot.angle;
        if (this.shape instanceof Circle && snapshot.radius !== undefined) {
            this.shape.r = snapshot.radius;
        } else if (this.shape instanceof Rect && snapshot.width !== undefined && snapshot.height !== undefined) {
            this.shape.w = snapshot.width;
            this.shape.h = snapshot.height;
            this.shape.center = snapshot.center;
        } else if (this.shape instanceof Polygon && snapshot.vertices !== undefined) {
            this.shape.vertices = snapshot.vertices;
        }
        this.shape.options.spellArea = { ...snapshot.spellArea };
        propertiesSystem.setFillColour(this.shape.id, snapshot.fillColour, NO_SYNC);
        propertiesSystem.setStrokeColour(this.shape.id, snapshot.strokeColour[0]!, NO_SYNC);
        propertiesSystem.setIsInvisible(this.shape.id, snapshot.isInvisible, NO_SYNC);
        this.shape.layer?.invalidate(true);
        if (snapshot.spellArea.showPublic) {
            sendShapePositionUpdate([this.shape], false);
            sendShapeSizeUpdate({ shape: this.shape, temporary: false });
        }
    }

    async onContextMenu(): Promise<boolean> {
        await this.close({ dropShapeId: true, deselectTool: true });
        return false;
    }

    close(options: { dropShapeId: boolean; deselectTool: boolean }): Promise<void> {
        if (this.shape !== undefined) {
            const layer = floorState.currentLayer.value;
            if (layer === undefined) return Promise.resolve();

            if (this.state.isEditing) {
                if (options.dropShapeId) {
                    this.restoreEditSnapshot();
                } else {
                    propertiesSystem.setIsInvisible(this.shape.id, !this.state.showPublic, NO_SYNC);
                    layer.removeShape(this.shape, {
                        sync: SyncMode.FULL_SYNC,
                        recalculate: false,
                        dropShapeId: false,
                    });
                    layer.addShape(this.shape, SyncMode.FULL_SYNC, InvalidationMode.NORMAL);
                }
            } else {
                layer.removeShape(this.shape, {
                    sync: this.state.showPublic ? SyncMode.TEMP_SYNC : SyncMode.NO_SYNC,
                    recalculate: false,
                    dropShapeId: options.dropShapeId,
                });

                if (!options.dropShapeId) {
                    propertiesSystem.setIsInvisible(this.shape.id, !this.state.showPublic, NO_SYNC);
                    layer.addShape(this.shape, SyncMode.FULL_SYNC, InvalidationMode.NORMAL);
                }
            }
            this.shape = undefined;
        }

        this.stopAimGuide();
        this.dragging = false;
        this.state.isEditing = false;
        this.editSnapshot = undefined;
        this.appliedSize = 0;
        if (options.deselectTool) activateTool(ToolName.Select);
        return Promise.resolve();
    }
}

export const spellTool = new SpellTool();
