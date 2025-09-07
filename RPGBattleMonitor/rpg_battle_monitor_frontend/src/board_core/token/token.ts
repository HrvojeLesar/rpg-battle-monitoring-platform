import { SpriteOptions } from "pixi.js";
import { ContainerExtensionOptions } from "../extensions/container_extension";
import {
    SpriteExtension,
    SpriteExtensionAttributes,
} from "../extensions/sprite_extension";
import { UId, type TypedJson } from "../interfaces/messagable";
import { Scene } from "../scene";
import { TokenDataBase } from "./token_data";
import { GBoard } from "../board";

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

        this.eventEmitter.on("drag-end", this.update.bind(this));
        this.eventEmitter.on("resize-end", this.update.bind(this));
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
    }

    protected update(): void {
        GBoard.websocket.queue(this, "updateQueue");
    }

    public get tokenData(): TokenDataBase {
        return this._tokenData;
    }
}
