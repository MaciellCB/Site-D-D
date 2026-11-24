import type { ApiExploredRegion, FogExploredUpdate } from "../../../apiTypes";
import { getUnitDistance, g2l, g2lz, g2lr, toRadians } from "../../../core/conversions";
import { DEFAULT_GRID_SIZE } from "../../../core/grid";
import type { LocalId } from "../../../core/id";
import type { SyncMode } from "../../../core/models/types";
import { sendFogExploredUpdate } from "../../api/emits/floor";
import { FOG_COLOUR } from "../../colour";
import { getShape } from "../../id";
import type { IShape } from "../../interfaces/shape";
import { LayerName } from "../../models/floor";
import { polygon2path } from "../../rendering/basic";
import { accessState } from "../../systems/access/state";
import { auraSystem } from "../../systems/auras";
import { floorSystem } from "../../systems/floors";
import { floorState } from "../../systems/floors/state";
import { gameState } from "../../systems/game/state";
import { positionState } from "../../systems/position/state";
import { locationSettingsSystem } from "../../systems/settings/location";
import { locationSettingsState } from "../../systems/settings/location/state";
import { AMBIENT_SYMBOL, PORTAL_RANGE, TriangulationTarget, visionState } from "../../vision/state";
import { computeVisibility } from "../../vision/te";
import { createCanvas, updateCanvasDimensions, updateCanvasPixelRatio } from "../canvas";

import { FowLayer } from "./fow";

function getRegionKey(points: readonly [number, number][]): string {
    let hash = 0x811c9dc5;
    for (const [x, y] of points) {
        for (const value of [Math.round(x * 10), Math.round(y * 10)]) {
            hash = Math.imul(hash ^ value, 0x01000193);
        }
    }
    return `${points.length}-${(hash >>> 0).toString(36)}`;
}

export class FowLightingLayer extends FowLayer {
    private readonly exploredCanvas = createCanvas();
    private readonly exploredCtx = this.exploredCanvas.getContext("2d")!;
    private readonly exploredRegions = new Map<string, ApiExploredRegion>();
    private readonly lastRecordedPositions = new Map<LocalId, { x: number; y: number; iteration: number }>();
    private pendingExploredRegions: ApiExploredRegion[] = [];
    private exploredSyncTimer: number | undefined;

    resize(): void {
        super.resize();
        updateCanvasDimensions(this.exploredCanvas);
    }

    updatePixelRatio(): void {
        super.updatePixelRatio();
        updateCanvasPixelRatio(this.exploredCanvas);
    }

    setExploredRegions(regions: ApiExploredRegion[]): void {
        this.mergeExploredRegions(regions, false, false);
    }

    mergeExploredRegions(regions: ApiExploredRegion[], syncToServer = false, invalidate = true): void {
        const added: ApiExploredRegion[] = [];
        for (const region of regions) {
            if (region.points.length < 3 || this.exploredRegions.has(region.key)) continue;
            const copy = {
                key: region.key,
                points: region.points.map(([x, y]) => [x, y] as [number, number]),
            };
            this.exploredRegions.set(copy.key, copy);
            added.push(copy);
        }

        if (added.length === 0) return;
        if (invalidate) this.invalidate(true);

        if (syncToServer) {
            this.pendingExploredRegions.push(...added);
            this.scheduleExploredSync();
        }
    }

    private scheduleExploredSync(): void {
        if (this.exploredSyncTimer !== undefined) return;
        this.exploredSyncTimer = window.setTimeout(() => {
            this.exploredSyncTimer = undefined;
            const floor = floorSystem.getFloor({ id: this.floor });
            const regions = this.pendingExploredRegions.splice(0, 4);
            if (floor !== undefined && regions.length > 0) {
                const data: FogExploredUpdate = { floor: floor.name, regions };
                sendFogExploredUpdate(data);
            }
            if (this.pendingExploredRegions.length > 0) this.scheduleExploredSync();
        }, 500);
    }

    private recordExploredRegions(): void {
        const regions: ApiExploredRegion[] = [];
        const maxRange = locationSettingsState.raw.visionMaxRange.value;
        if (maxRange <= 0) return;
        const iteration = visionState.getVisionIteration(this.floor);
        const minimumMovement = DEFAULT_GRID_SIZE / 2;
        for (const tokenId of accessState.activeTokens.value.get("vision") ?? []) {
            const shape = getShape(tokenId);
            if (shape === undefined || shape.floorId !== this.floor || shape.layerName === LayerName.Dm) continue;

            const center = shape.center;
            const previous = this.lastRecordedPositions.get(shape.id);
            if (
                previous !== undefined &&
                previous.iteration === iteration &&
                (center.x - previous.x) ** 2 + (center.y - previous.y) ** 2 < minimumMovement ** 2
            ) {
                continue;
            }
            this.lastRecordedPositions.set(shape.id, { ...center, iteration });

            const points = computeVisibility(
                center,
                TriangulationTarget.VISION,
                this.floor,
                false,
                getUnitDistance(maxRange),
            ).visibility.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as [number, number]);
            if (points.length < 3) continue;
            const key = getRegionKey(points);
            if (!this.exploredRegions.has(key)) regions.push({ key, points });
        }

        this.mergeExploredRegions(regions, true, false);
    }

    private drawExploredFog(): void {
        const ctx = this.exploredCtx;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";

        for (const region of this.exploredRegions.values()) {
            ctx.fill(polygon2path(region.points));
        }

        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(this.canvas, 0, 0, this.width, this.height);

        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.drawImage(this.exploredCanvas, 0, 0, this.width, this.height);

        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalCompositeOperation = "source-over";

        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.drawImage(this.exploredCanvas, 0, 0, this.width, this.height);
    }

    // We still need removeShapes as this does not inherently call .setLayer, which addShape does
    removeShape(shape: IShape, options: { sync: SyncMode; recalculate: boolean; dropShapeId: boolean }): boolean {
        let idx = -1;
        if (shape.options.preFogShape ?? false) {
            idx = this.preFogShapes.findIndex((s) => s.id === shape.id);
        }
        const remove = super.removeShape(shape, options);
        if (remove) {
            if (idx >= 0) this.preFogShapes.splice(idx, 1);
            if (shape.options.ambientBarrier ?? false) {
                visionState.removeAmbientBarrier(shape.id, this.floor);
            }
        }
        return remove;
    }

    enterLayer(shape: IShape): void {
        if (shape.options.preFogShape ?? false) {
            this.preFogShapes.push(shape);
        }
        if (shape.options.ambientBarrier ?? false) {
            visionState.addAmbientBarrier(shape.id, this.floor);
        }
    }

    exitLayer(shape: IShape): void {
        this.preFogShapes = this.preFogShapes.filter((s) => s.id !== shape.id);
        if (shape.options.ambientBarrier ?? false) {
            visionState.removeAmbientBarrier(shape.id, this.floor);
        }
    }

    private drawAmbientLight(shapeId: LocalId | typeof AMBIENT_SYMBOL): void {
        this.vCtx.globalCompositeOperation = "source-over";
        this.vCtx.fillStyle = "rgba(0, 0, 0, 1)";
        this.vCtx.fillRect(0, 0, this.width, this.height);

        this.vCtx.globalCompositeOperation = "destination-out";
        const interiorMask = visionState.getInteriorPath(this.floor, shapeId);
        if (interiorMask !== undefined) {
            const { panX, panY, zoom } = positionState.readonly;
            this.vCtx.save();
            this.vCtx.transform(zoom, 0, 0, zoom, panX * zoom, panY * zoom);
            this.vCtx.fill(interiorMask);
            this.vCtx.lineWidth = 1 / zoom;
            this.vCtx.strokeStyle = "rgba(0, 0, 0, 1)";
            this.vCtx.stroke(interiorMask);
            this.vCtx.restore();
        }

        this.vCtx.globalCompositeOperation = "source-over";
        const portalMasks = visionState.getPortalMasks(this.floor, shapeId);
        if (portalMasks.length > 0) {
            const { panX, panY, zoom } = positionState.readonly;
            const range = PORTAL_RANGE;
            this.vCtx.save();
            this.vCtx.transform(zoom, 0, 0, zoom, panX * zoom, panY * zoom);
            for (const portal of portalMasks) {
                const gradient = this.vCtx.createRadialGradient(portal.cx, portal.cy, 0, portal.cx, portal.cy, range);
                gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
                gradient.addColorStop(0.35, "rgba(0, 0, 0, 1)");
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                this.vCtx.fillStyle = gradient;
                this.vCtx.fill(portal.path);
            }
            this.vCtx.restore();
        }

        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.drawImage(this.virtualCanvas, 0, 0, window.innerWidth, window.innerHeight);
    }

    draw(): void {
        if (!this.valid) {
            const originalOperation = this.ctx.globalCompositeOperation;
            super._draw();
            this.isEmpty = true;

            const activeFloor = floorState.currentFloor.value!;
            const isLosActive = locationSettingsSystem.isLosActive();
            if (
                gameState.raw.isDm &&
                isLosActive &&
                locationSettingsState.raw.fullFow.value &&
                this.floor === activeFloor.id
            ) {
                this.recordExploredRegions();
            }

            // At all times provide a minimal vision range to prevent losing your tokens in fog.
            if (
                locationSettingsState.raw.fullFow.value &&
                floorSystem.hasLayer(activeFloor, LayerName.Tokens) &&
                activeFloor.id === this.floor
            ) {
                for (const sh of accessState.activeTokens.value.get("vision") ?? []) {
                    const shape = getShape(sh);
                    if (shape === undefined) continue;
                    if (shape.options.skipDraw ?? false) continue;
                    if (shape.floorId !== activeFloor.id) continue;
                    if (shape.layerName === LayerName.Dm && gameState.raw.isFakePlayer) continue;
                    const bb = shape.getBoundingBox();
                    const lcenter = g2l(shape.center);
                    const alm = 0.8 * g2lz(bb.w);
                    this.ctx.beginPath();
                    this.ctx.arc(lcenter.x, lcenter.y, alm, 0, 2 * Math.PI);

                    const gradient = this.ctx.createRadialGradient(
                        lcenter.x,
                        lcenter.y,
                        alm / 2,
                        lcenter.x,
                        lcenter.y,
                        alm,
                    );
                    gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
                    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                    this.ctx.fillStyle = gradient;

                    this.ctx.fill();

                    // Out of Bounds check
                    if (
                        // It's overkill to check this if fowLos is set
                        !isLosActive &&
                        bb.visibleInCanvas({ w: this.width, h: this.height })
                    ) {
                        this.isEmpty = false;
                    }
                }
            }

            // First cut out all the light sources
            if (locationSettingsState.raw.fullFow.value) {
                const shapesBoundChecked = new Set<LocalId>();
                for (const light of visionState.getVisionSourcesInView(this.floor)) {
                    const shape = getShape(light.shape);
                    if (shape === undefined) continue;
                    const aura = auraSystem.get(shape.id, light.aura);
                    if (aura === undefined) continue;

                    // Out of Bounds check
                    if (!isLosActive) {
                        if (!shapesBoundChecked.has(shape.id)) {
                            shapesBoundChecked.add(shape.id);
                            if (shape._visionBbox?.visibleInCanvas({ w: this.width, h: this.height }) ?? false) {
                                this.isEmpty = false;
                            }
                        }
                    }

                    if (aura.floodLight) {
                        this.drawAmbientLight(shape.id);
                        continue;
                    }

                    const auraValue = aura.value > 0 && !isNaN(aura.value) ? aura.value : 0;
                    const auraDim = aura.dim > 0 && !isNaN(aura.dim) ? aura.dim : 0;

                    if (auraValue + auraDim === 0) continue;

                    const center = shape.center;
                    const lcenter = g2l(center);
                    const innerRange = g2lr(auraValue + auraDim);

                    const visionMask = new Path2D();
                    visionMask.addPath(shape.visionPolygon);

                    // Behind vision mode rendering
                    // Render the additional vision polygon for the light source.
                    // This is calculated in the vision layer,
                    if (visionState.behindVisionLightPaths.has(shape.id)) {
                        for (const points of visionState.behindVisionLightPaths.get(shape.id)!) {
                            visionMask.addPath(polygon2path(points));
                        }
                    } else if (!isLosActive) {
                        // If we're not using LOS, the light cache is never filled by the vision layer.
                        // We just need to render all of them, as there is no vision shape that constrains this.
                        for (const [, bpPoints] of shape._behindPatches) {
                            for (const { points } of bpPoints) {
                                visionMask.addPath(polygon2path(points));
                            }
                        }
                    }

                    this.ctx.save();
                    this.ctx.globalCompositeOperation = "source-over";
                    this.ctx.clip(visionMask);
                    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";

                    if (auraDim > 0) {
                        // Fill the light aura with a radial dropoff towards the outside.
                        const gradient = this.ctx.createRadialGradient(
                            lcenter.x,
                            lcenter.y,
                            g2lr(auraValue),
                            lcenter.x,
                            lcenter.y,
                            innerRange,
                        );
                        gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
                        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                        this.ctx.fillStyle = gradient;
                    }
                    this.ctx.beginPath();

                    const angleA = shape.angle + toRadians(aura.direction - aura.angle / 2);
                    const angleB = shape.angle + toRadians(aura.direction + aura.angle / 2);

                    if (aura.angle < 360) {
                        this.ctx.moveTo(lcenter.x, lcenter.y);
                        this.ctx.lineTo(
                            lcenter.x + innerRange * Math.cos(angleA),
                            lcenter.y + innerRange * Math.sin(angleA),
                        );
                    }
                    this.ctx.arc(lcenter.x, lcenter.y, innerRange, angleA, angleB);
                    if (aura.angle < 360) {
                        this.ctx.lineTo(lcenter.x, lcenter.y);
                    }

                    this.ctx.fill();
                    this.ctx.restore();
                }
            }

            if (
                locationSettingsState.raw.ambientLight.value &&
                locationSettingsState.raw.fullFow.value &&
                this.floor === activeFloor.id
            ) {
                this.drawAmbientLight(AMBIENT_SYMBOL);
            }

            if (isLosActive && this.floor === activeFloor.id) {
                this.ctx.globalCompositeOperation = "source-in";
                this.ctx.drawImage(
                    floorSystem.getLayer(activeFloor, LayerName.Vision)!.canvas,
                    0,
                    0,
                    window.innerWidth,
                    window.innerHeight,
                );
            }

            for (const preShape of this.preFogShapes) {
                if (!preShape.visibleInCanvas({ w: this.width, h: this.height }, { includeAuras: true })) continue;
                const ogComposite = preShape.globalCompositeOperation;
                if (!locationSettingsState.raw.fullFow.value) {
                    if (preShape.globalCompositeOperation === "source-over")
                        preShape.globalCompositeOperation = "destination-out";
                    else if (preShape.globalCompositeOperation === "destination-out")
                        preShape.globalCompositeOperation = "source-over";
                }
                preShape.draw(this.ctx, false);
                preShape.globalCompositeOperation = ogComposite;
                this.isEmpty = false;
            }

            if (locationSettingsState.raw.fullFow.value && this.floor === activeFloor.id) {
                this.ctx.globalCompositeOperation = "source-out";
                this.ctx.fillStyle = FOG_COLOUR;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }

            if (
                locationSettingsState.raw.fullFow.value &&
                isLosActive &&
                this.floor === activeFloor.id &&
                this.exploredRegions.size > 0
            ) {
                this.drawExploredFog();
            }

            super.draw(false);

            this.ctx.globalCompositeOperation = originalOperation;
        }
    }
}
