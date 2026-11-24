<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { getImageSrcFromHash } from "../../../assets/utils";
import type { LocalId } from "../../../core/id";
import { getShape } from "../../id";
import type { IShape } from "../../interfaces/shape";
import type { IAsset } from "../../interfaces/shapes/asset";
import { accessSystem } from "../../systems/access";
import { accessState } from "../../systems/access/state";
import { getProperties } from "../../systems/properties/state";
import { visionTool } from "../../tools/variants/vision";

const { t } = useI18n();
const selected = visionTool.isActiveTool;

const tokens = computed(() => {
    const tokenIds = accessState.reactive.ownedTokens.get("vision") ?? new Set<LocalId>();
    return [...tokenIds]
        .map((id) => getShape(id))
        .filter((shape): shape is IShape => shape !== undefined && !(shape.options.skipDraw ?? false));
});
const selection = computed(() => {
    const activeTokens = accessState.reactive.activeTokenFilters.get("vision");
    if (activeTokens) return new Set(activeTokens);
    return new Set(accessState.reactive.ownedTokens.get("vision") ?? []);
});

function toggle(token: LocalId): void {
    if (selection.value.has(token)) accessSystem.removeActiveToken(token, "vision");
    else accessSystem.addActiveToken(token, "vision");
}

function getImageSrc(token: IShape): string {
    if (token.type === "assetrect") {
        return getImageSrcFromHash((token as IAsset).assetHash);
    }
    return "";
}

function getTokenName(token: IShape): string {
    return getProperties(token.id)?.name ?? t("game.ui.tools.VisionTool.unnamed_token");
}
</script>

<template>
    <div v-if="selected" class="tool-detail">
        <header class="vision-header">
            <strong>{{ t("game.ui.tools.VisionTool.title") }}</strong>
            <span>{{ t("game.ui.tools.VisionTool.description") }}</span>
        </header>
        <button
            v-for="token in tokens"
            :key="token.id"
            type="button"
            class="token"
            :class="{ selected: selection.has(token.id) }"
            :aria-pressed="selection.has(token.id)"
            @click="toggle(token.id)"
        >
            <img v-if="getImageSrc(token) !== ''" :src="getImageSrc(token)" width="30px" height="30px" alt="" />
            <span v-else class="token-placeholder">{{ getTokenName(token).slice(0, 1).toUpperCase() }}</span>
            <span class="token-name">{{ getTokenName(token) }}</span>
            <span class="token-state">{{
                selection.has(token.id) ? t("game.ui.tools.VisionTool.active") : t("game.ui.tools.VisionTool.inactive")
            }}</span>
        </button>
        <p v-if="tokens.length === 0" class="vision-empty">
            {{ t("game.ui.tools.VisionTool.empty") }}
        </p>
    </div>
</template>

<style scoped lang="scss">
.tool-detail {
    display: block;
    min-width: 17rem;
}

.vision-header {
    display: grid;
    gap: 0.3rem;
    margin-bottom: 0.75rem;

    strong {
        color: #f5eafa;
        font-size: 0.95rem;
    }

    span {
        max-width: 22rem;
        color: #b6a8bb;
        font-size: 0.78rem;
        line-height: 1.4;
    }
}

.token {
    display: flex;
    width: 100%;
    min-height: 3.2rem;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 0.45rem;
    padding: 0.45rem 0.6rem;
    border: 1px solid rgba(192, 132, 212, 0.24);
    border-radius: 0.65rem;
    background: rgba(255, 255, 255, 0.025);
    color: #d7cbdc;
    cursor: pointer;
    font: inherit;
    text-align: left;
    transition:
        background-color 150ms ease,
        border-color 150ms ease,
        color 150ms ease;

    &:hover {
        border-color: rgba(224, 170, 255, 0.55);
        background: rgba(156, 39, 176, 0.14);
        color: #fff;
    }

    &:last-child {
        margin-bottom: 0;
    }

    > img,
    .token-placeholder {
        width: 2rem;
        height: 2rem;
        flex: 0 0 2rem;
        border-radius: 0.45rem;
        object-fit: cover;
    }

    .token-name {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .token-state {
        flex: 0 0 auto;
        color: #aa99b1;
        font-size: 0.7rem;
    }
}

.token-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #35213f;
    color: #e0aaff;
    font-size: 0.95rem;
    font-weight: 700;
}

.token.selected {
    border-color: rgba(224, 170, 255, 0.64);
    background: linear-gradient(105deg, rgba(126, 35, 148, 0.4), rgba(73, 34, 88, 0.3));
    color: #fff;

    .token-state {
        color: #e0aaff;
    }
}

.vision-empty {
    margin: 0;
    padding: 0.75rem;
    border: 1px dashed rgba(192, 132, 212, 0.28);
    border-radius: 0.55rem;
    color: #aa99b1;
    font-size: 0.8rem;
}

@media (max-width: 520px) {
    .tool-detail {
        min-width: 0;
    }
}
</style>
