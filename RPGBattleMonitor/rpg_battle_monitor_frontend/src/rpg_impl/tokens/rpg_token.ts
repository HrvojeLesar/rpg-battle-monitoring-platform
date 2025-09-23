import { ContainerExtensionOptions } from "@/board_core/extensions/container_extension";
import { Scene } from "@/board_core/scene";
import { Token } from "@/board_core/token/token";
import { SpriteOptions } from "pixi.js";
import { RpgTokenData } from "./rpg_token_data";
import { sizeToGridCellMultiplier } from "../characters_stats/combat";

export class RpgToken extends Token {
    public constructor(
        scene: Scene,
        tokenData: RpgTokenData,
        spriteOptions?: SpriteOptions,
        containerOptions?: ContainerExtensionOptions,
    ) {
        super(scene, tokenData, spriteOptions, containerOptions);

        if (this.displayedEntity) {
            this.displayedEntity.width =
                scene.grid.cellSize *
                sizeToGridCellMultiplier(this.tokenData.size);
            this.displayedEntity.height =
                scene.grid.cellSize *
                sizeToGridCellMultiplier(this.tokenData.size);
        }
    }

    public get tokenData(): RpgTokenData {
        return this._tokenData as RpgTokenData;
    }
}
