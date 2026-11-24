import { gameState } from "../../systems/game/state";

import { Layer } from "./layer";

export class DmLayer extends Layer {
    protected opacity = 0.5;

    draw(doClear = true): void {
        if (gameState.raw.isFakePlayer) {
            if (doClear) this.clear();
        } else {
            super.draw(doClear);
        }
    }
}
