import { Assets, ProgressCallback, Sprite, Texture } from "pixi.js";

export type AssetSpritePair = {
    sprite: Sprite;
    url: string;
};

class AssetManager {
    protected textureUseCount: Map<Texture, number> = new Map();

    public async load(
        pairs: AssetSpritePair | AssetSpritePair[],
        onProgress?: ProgressCallback,
    ): Promise<Record<string, Texture>> {
        if (!Array.isArray(pairs)) {
            pairs = [pairs];
        }

        const sources = pairs.map((pair) => {
            return pair.url;
        });

        let textures: Record<string, Texture> = {};
        try {
            // TODO: Stop duplicate loads
            textures = await Assets.load<Texture>(sources, onProgress);
        } catch (e) {
            console.error(e);
        }

        pairs.forEach((pair) => {
            const sprite = pair.sprite;
            if (sprite.destroyed) {
                return;
            }

            const texture = textures[pair.url];
            if (texture !== undefined) {
                this.incrementTextureUseCount(texture);
                sprite.texture = texture;
            }
        });

        return textures;
    }

    public async unload(object: Sprite | Texture): Promise<void> {
        let texture = object;
        if (object instanceof Sprite) {
            texture = object.texture;
            if (object.destroyed === false) {
                object.texture = Texture.WHITE;
            }
        }

        if (!(texture instanceof Texture)) {
            return;
        }

        const identifier = texture.label;

        if (identifier === undefined) {
            return;
        }

        if (this.shouldUnloadAndDecrementCount(texture)) {
            Assets.unload(identifier);
        }
    }

    protected incrementTextureUseCount(texture: Texture): number {
        const count = (this.textureUseCount.get(texture) ?? 0) + 1;
        this.textureUseCount.set(texture, count);

        return count;
    }

    protected shouldUnloadAndDecrementCount(texture: Texture): boolean {
        const count = this.decrementTextureUseCount(texture);

        return count <= 0;
    }

    protected decrementTextureUseCount(texture: Texture): number {
        if (!this.textureUseCount.has(texture)) {
            return 0;
        }

        const count = (this.textureUseCount.get(texture) ?? 1) - 1;

        this.textureUseCount.set(texture, count);

        if (count === 0) {
            this.textureUseCount.delete(texture);
        }

        return count;
    }
}

export const GAssetManager = new AssetManager();
