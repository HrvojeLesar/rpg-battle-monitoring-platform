import { Sprite, SpriteOptions } from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionOptions,
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
}
