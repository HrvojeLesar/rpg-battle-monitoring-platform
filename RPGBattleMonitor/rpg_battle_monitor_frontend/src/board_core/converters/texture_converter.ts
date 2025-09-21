import { BufferImageSource, Sprite, Texture } from "pixi.js";
import { GAssetManager } from "../assets/asset_manager";
import { getUrl } from "@/board_react_wrapper/utils/utils";

export const LOAD_TEXTURE = "load-texture:";

function createEmptyWhiteTexture(label?: string): Texture {
    return new Texture({
        source: new BufferImageSource({
            resource: new Uint8Array([255, 255, 255, 255]),
            width: 1,
            height: 1,
            alphaMode: "premultiply-alpha-on-upload",
            label: label === undefined ? `${LOAD_TEXTURE}${label}` : "WHITE",
        }),
        label: label === undefined ? `${LOAD_TEXTURE}${label}` : "WHITE",
    });
}

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
            const path = data.slice(LOAD_TEXTURE.length);
            const url = getUrl(path);
            GAssetManager.load({
                sprite,
                url,
            });

            // TODO: add loading texture
            return createEmptyWhiteTexture(path);
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

        if (label.startsWith(LOAD_TEXTURE)) {
            return label;
        }

        return "";
    }
}
