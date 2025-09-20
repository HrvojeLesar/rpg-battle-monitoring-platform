import { BufferImageSource, Sprite, Texture } from "pixi.js";
import { GAssetManager } from "../assets/asset_manager";

const LOAD_TEXTURE = "load-texture:";

function createEmptyWhiteTexture(label?: string): Texture {
    return new Texture({
        source: new BufferImageSource({
            resource: new Uint8Array([255, 255, 255, 255]),
            width: 1,
            height: 1,
            alphaMode: "premultiply-alpha-on-upload",
            label: label ?? "WHITE",
        }),
        label: label ?? "WHITE",
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
            const url = data.slice(LOAD_TEXTURE.length);
            GAssetManager.load({
                sprite,
                url,
            });

            // TODO: add loading texture
            return createEmptyWhiteTexture(url);
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
