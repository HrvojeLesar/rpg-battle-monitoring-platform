import { ContainerExtensionOptions } from "@/board_core/extensions/container_extension";
import { Scene } from "@/board_core/scene";
import { Token } from "@/board_core/token/token";
import { SpriteOptions } from "pixi.js";
import { DecorationTokenData } from "./decoration_token_data";

export class DecorationToken extends Token {
    public constructor(
        scene: Scene,
        tokenData: DecorationTokenData,
        spriteOptions?: SpriteOptions,
        containerOptions?: ContainerExtensionOptions,
    ) {
        super(scene, tokenData, spriteOptions, containerOptions);
    }
}
