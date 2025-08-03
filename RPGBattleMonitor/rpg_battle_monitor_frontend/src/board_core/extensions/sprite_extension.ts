import { Sprite, SpriteOptions } from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionOptions,
    Ghost,
} from "./container_extension";

export class SpriteExtension extends ContainerExtension<Sprite> {
    public constructor(
        spriteOptions?: SpriteOptions,
        containerOptions?: ContainerExtensionOptions,
    ) {
        const sprite = new Sprite({
            ...spriteOptions,
            position: undefined,
            eventMode: "passive",
            cursor: "default",
        });

        super(containerOptions);

        this._displayedEntity = sprite;
        this.addChild(this._displayedEntity);
    }

    protected createGhostContainer(): Ghost {
        if (this.displayedEntity instanceof Sprite) {
            return new SpriteExtension(
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
}
