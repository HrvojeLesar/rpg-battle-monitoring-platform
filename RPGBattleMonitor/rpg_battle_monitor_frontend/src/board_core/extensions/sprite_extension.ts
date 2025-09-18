import { ColorSource, Sprite, SpriteOptions } from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionAttributes,
    ContainerExtensionOptions,
    Ghost,
} from "./container_extension";
import { Grid } from "../grid/grid";
import { DeleteAction, TypedJson } from "../interfaces/messagable";
import { TextureConverter } from "../converters/texture_converter";
import { GAssetManager } from "../assets/asset_manager";

export type SpriteExtensionAttributes = {
    alpha: number;
    tint: ColorSource;
    spriteTexture: string;
} & ContainerExtensionAttributes;

export class SpriteExtension extends ContainerExtension<
    Sprite,
    SpriteExtensionAttributes
> {
    public constructor(
        grid: Grid,
        spriteOptions?: SpriteOptions,
        containerOptions?: ContainerExtensionOptions,
    ) {
        const sprite = new Sprite({
            ...spriteOptions,
            position: undefined,
            eventMode: "passive",
            cursor: "default",
        });

        super(grid, containerOptions);

        this._displayedEntity = sprite;
        this.addChildAt(this._displayedEntity, 0);
    }

    protected createGhostContainer(): Ghost {
        if (this.displayedEntity instanceof Sprite) {
            return new SpriteExtension(
                this.grid,
                this.cloneSpriteOptions(this.displayedEntity),
                this.cloneContainerOptions(this),
            );
        }

        throw new Error("Failed to create sprite extension ghost");
    }

    protected cloneSpriteOptions(container: Sprite): SpriteOptions {
        return {
            alpha: 0.65,
            tint: container.tint,
            width: container.width,
            height: container.height,
            eventMode: "passive",
            texture: container.texture,
        };
    }

    public getAttributes(): SpriteExtensionAttributes {
        if (this.displayedEntity === undefined) {
            throw new Error("Sprite extension has no displayed entity");
        }

        return {
            ...super.getAttributes(),
            alpha: this.displayedEntity.alpha,
            tint: this.displayedEntity.tint,
            spriteTexture: TextureConverter.fromTexture(
                this.displayedEntity.texture,
            ),
        };
    }

    public applyUpdateAction(
        changes: TypedJson<SpriteExtensionAttributes>,
    ): void {
        super.applyUpdateAction(changes);
        if (this.displayedEntity) {
            const texture = TextureConverter.toTexture(
                changes.spriteTexture,
                this.displayedEntity,
            );
            this.displayedEntity.alpha = changes.alpha;
            this.displayedEntity.tint = changes.tint;
            this.displayedEntity.texture = texture;
        }
    }

    public deleteAction(action: DeleteAction): void {
        if (this.displayedEntity) {
            GAssetManager.unload(this.displayedEntity);
        }

        super.deleteAction(action);
    }
}
