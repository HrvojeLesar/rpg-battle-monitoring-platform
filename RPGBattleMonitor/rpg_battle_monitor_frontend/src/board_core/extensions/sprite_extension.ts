import {
    ColorSource,
    Sprite,
    SpriteOptions,
    Texture,
    TextureSource,
} from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionAttributes,
    ContainerExtensionOptions,
    Ghost,
} from "./container_extension";
import { Grid } from "../grid/grid";

export type SpriteExtensionAttributes = {
    alpha?: number;
    tint?: ColorSource;
    texture?: Texture<TextureSource<any>>;
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
        return {
            alpha: this.displayedEntity?.alpha,
            tint: this.displayedEntity?.tint,
            texture: this.displayedEntity?.texture,
            ...super.getAttributes(),
        };
    }
}
