import { Sprite, Texture } from "pixi.js";
import { GAssetManager } from "../assets/asset_manager";

const LOAD_TEXTURE = "load-texture:";

export class TextureConverter {
    public static toTexture(data: string, sprite: Sprite): Texture {
        if (data.length === 0) {
            return Texture.EMPTY;
        }

        if (data === "EMPTY") {
            return Texture.EMPTY;
        }

        if (data === "WHITE") {
            return Texture.WHITE;
        }

        if (data.startsWith(LOAD_TEXTURE)) {
            const url = data.slice(LOAD_TEXTURE.length);
            GAssetManager.load({
                sprite,
                url,
            });

            return Texture.WHITE;
        }

        return Texture.WHITE;
    }

    public static fromTexture(data: Texture): string {
        const label = data.label;
        if (label === undefined) {
            return "";
        }

        if (label === "EMPTY" || label === "WHITE") {
            return label;
        }

        if (label.startsWith("http")) {
            return `${LOAD_TEXTURE}${label}`;
        }

        return "";
    }
}
