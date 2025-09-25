import { SpriteOptions } from "pixi.js";
import { ContainerExtensionOptions } from "../extensions/container_extension";
import {
    SpriteExtension,
    SpriteExtensionAttributes,
} from "../extensions/sprite_extension";
import { DeleteAction, UId, type TypedJson } from "../interfaces/messagable";
import { Scene } from "../scene";
import { TokenDataBase } from "./token_data";
import {
    LOAD_TEXTURE,
    TextureConverter,
} from "../converters/texture_converter";
import { GAssetManager } from "../assets/asset_manager";

export type TokenAttributes = {
    gridUid: UId;
    sceneUid: UId;
    tokenData: UId;
} & SpriteExtensionAttributes;

export class Token extends SpriteExtension {
    protected _scene: Scene;
    protected _tokenData: TokenDataBase;

    public constructor(
        scene: Scene,
        tokenData: TokenDataBase,
        spriteOptions?: SpriteOptions,
        containerOptions?: ContainerExtensionOptions,
    ) {
        super(scene.grid, spriteOptions, containerOptions);

        this._scene = scene;
        this._tokenData = tokenData;
    }

    public get scene(): Scene {
        return this._scene;
    }

    public set scene(value: Scene) {
        this._scene = value;
    }

    public getAttributes(): TokenAttributes {
        return {
            ...super.getAttributes(),
            sceneUid: this.scene.getUId(),
            tokenData: this._tokenData.getUId(),
            gridUid: this._grid.getUId(),
        };
    }

    public applyUpdateAction(changes: TypedJson<TokenAttributes>): void {
        super.applyUpdateAction(changes);
        this.setTexture();
    }

    public get tokenData(): TokenDataBase {
        return this._tokenData;
    }

    public deleteAction(action: DeleteAction): void {
        action.cleanupCallbacks.push(() => {
            this.scene.removeToken(this);
        });

        super.deleteAction(action);
    }

    public setTexture(): void {
        if (this.displayedEntity) {
            const loadTexture = `${LOAD_TEXTURE}${this.tokenData.image}`;
            if (this.displayedEntity.texture.label !== loadTexture) {
                GAssetManager.unload(this.displayedEntity);
                const texture = TextureConverter.toTexture(
                    loadTexture,
                    this.displayedEntity,
                );

                this.displayedEntity.texture = texture;
            }
        }
    }
}
