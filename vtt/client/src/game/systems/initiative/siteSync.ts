import { io } from "socket.io-client";
import { watch } from "vue";

import type { GlobalId } from "../../../core/id";
import { getAllShapes, getGlobalId } from "../../id";
import { gameState } from "../game/state";
import { getProperties, propertiesState } from "../properties/state";

import { InitiativeSort } from "./models";
import { initiativeState } from "./state";

import { initiativeSystem } from ".";

interface SiteInitiativeEntry {
    name: string;
    value: number;
}

function normalizeName(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

function parseLinks(raw: string | null, onError: (message: string) => void): Map<string, string[]> {
    if (raw === null) return new Map();

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new TypeError("Initiative links must be an array");

        const links = new Map<string, string[]>();
        for (const entry of parsed) {
            if (
                typeof entry !== "object" ||
                entry === null ||
                !("ficha" in entry) ||
                !("personagem" in entry) ||
                typeof entry.ficha !== "string" ||
                typeof entry.personagem !== "string"
            ) {
                throw new TypeError("Initiative link is invalid");
            }

            const ficha = normalizeName(entry.ficha);
            const personagem = entry.personagem.trim();
            if (ficha.length === 0 || personagem.length === 0) continue;
            const targets = links.get(ficha) ?? [];
            if (!targets.includes(personagem)) targets.push(personagem);
            links.set(ficha, targets);
        }
        return links;
    } catch (error) {
        console.error("Could not read site initiative links", error);
        onError("game.ui.site_initiative_invalid_links");
        return new Map();
    }
}

function parseEntries(data: unknown): SiteInitiativeEntry[] | undefined {
    if (!Array.isArray(data)) {
        console.error("Site initiative update is not a list", data);
        return undefined;
    }

    const entries: SiteInitiativeEntry[] = [];
    for (const entry of data) {
        if (
            typeof entry !== "object" ||
            entry === null ||
            !("name" in entry) ||
            typeof entry.name !== "string" ||
            !("val" in entry)
        ) {
            console.warn("Ignoring an invalid site initiative entry", entry);
            continue;
        }

        const value = Number(entry.val);
        if (!Number.isFinite(value)) {
            console.warn("Ignoring a site initiative entry with an invalid value", entry);
            continue;
        }
        entries.push({ name: entry.name, value });
    }
    return entries;
}

export function initializeSiteInitiativeSync(onError: (message: string) => void): () => void {
    const params = new URLSearchParams(window.location.search);
    const rawServerUrl = params.get("initiativeSocket");
    if (rawServerUrl === null) return () => {};

    let serverUrl: URL;
    try {
        serverUrl = new URL(rawServerUrl);
        const allowedOrigins = new Set(["http://localhost:3000", "https://dandd-chan.onrender.com"]);
        if (!allowedOrigins.has(serverUrl.origin)) {
            throw new TypeError("Unsupported initiative server protocol");
        }
    } catch (error) {
        console.error("Could not connect to site initiative", error);
        onError("game.ui.site_initiative_invalid_url");
        return () => {};
    }

    const links = parseLinks(params.get("initiativeLinks"), onError);
    const socket = io(serverUrl.origin, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
    });

    let latestEntries: SiteInitiativeEntry[] = [];
    let managedShapes = new Set<GlobalId>();
    let connectionErrorReported = false;
    let noMatchesReported = false;

    function syncInitiative(): void {
        if (!gameState.reactive.isDm) return;

        const targetValues = new Map<string, number>();
        const conflictedTargets = new Set<string>();
        for (const entry of latestEntries) {
            const targets = links.get(normalizeName(entry.name)) ?? [entry.name];
            for (const target of targets) {
                const key = normalizeName(target);
                if (key.length === 0 || conflictedTargets.has(key)) continue;
                const previousValue = targetValues.get(key);
                if (previousValue !== undefined && previousValue !== entry.value) {
                    console.warn(`Multiple site initiative entries map to "${target}"`);
                    targetValues.delete(key);
                    conflictedTargets.add(key);
                    continue;
                }
                targetValues.set(key, entry.value);
            }
        }

        const nextManagedShapes = new Set<GlobalId>();
        for (const shape of getAllShapes()) {
            const name = getProperties(shape.id)?.name;
            if (name === undefined || normalizeName(name) === normalizeName("Unknown Shape")) continue;
            const value = targetValues.get(normalizeName(name));
            if (value === undefined) continue;

            const globalId = getGlobalId(shape.id);
            if (globalId === undefined) continue;

            let actor = initiativeSystem.getDataSet().find((entry) => entry.globalId === globalId);
            if (actor === undefined) {
                initiativeSystem.addInitiative(shape.id);
                actor = initiativeSystem.getDataSet().find((entry) => entry.globalId === globalId);
            }
            if (actor === undefined) continue;

            if (actor.initiative !== value) initiativeSystem.setInitiative(globalId, value, true);
            nextManagedShapes.add(globalId);
        }

        if (nextManagedShapes.size > 0 && initiativeState.reactive.sort !== InitiativeSort.Down) {
            initiativeSystem.changeSort(InitiativeSort.Down, true);
        }

        for (const shape of managedShapes) {
            if (!nextManagedShapes.has(shape)) initiativeSystem.removeInitiative(shape, true);
        }
        managedShapes = nextManagedShapes;

        if (
            latestEntries.length > 0 &&
            propertiesState.reactive.data.size > 0 &&
            managedShapes.size === 0 &&
            !noMatchesReported
        ) {
            console.warn("No site initiative entries matched tokens in this location");
            onError("game.ui.site_initiative_no_matches");
            noMatchesReported = true;
        } else if (latestEntries.length === 0 || managedShapes.size > 0) {
            noMatchesReported = false;
        }
    }

    socket.on("connect", () => {
        connectionErrorReported = false;
    });
    socket.on("connect_error", (error: Error) => {
        console.error("Could not connect to site initiative", error);
        if (!connectionErrorReported) onError("game.ui.site_initiative_connection_error");
        connectionErrorReported = true;
    });
    socket.on("sync_tracker_update", (data: unknown) => {
        const entries = parseEntries(data);
        if (entries === undefined) return;
        latestEntries = entries;
        syncInitiative();
    });

    const stopWatching = watch(
        [
            () => [...propertiesState.reactive.data.values()].map((properties) => properties.name),
            () => gameState.reactive.isDm,
        ],
        syncInitiative,
    );

    return () => {
        stopWatching();
        socket.disconnect();
    };
}
