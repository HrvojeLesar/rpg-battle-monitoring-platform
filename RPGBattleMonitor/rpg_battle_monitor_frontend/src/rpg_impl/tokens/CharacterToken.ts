import { ContainerExtensionOptions } from "@/board_core/extensions/container_extension";
import { Scene } from "@/board_core/scene";
import { Token } from "@/board_core/token/token";
import { SpriteOptions } from "pixi.js";
import { CharacterTokenData } from "./CharacterTokenData";

export class CharacterToken extends Token {
    public constructor(
        scene: Scene,
        tokenData: CharacterTokenData,
        spriteOptions?: SpriteOptions,
        containerOptions?: ContainerExtensionOptions,
    ) {
        super(scene, tokenData, spriteOptions, containerOptions);
    }

    public get tokenData(): CharacterTokenData {
        return this._tokenData as CharacterTokenData;
    }
}
