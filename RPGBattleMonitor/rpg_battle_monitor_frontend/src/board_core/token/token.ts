import { GBoard } from "../board";
import { BaseEntity } from "../entity/base_entity";
import { ContainerExtension } from "../extensions/container_extension";
import { type TypedJson } from "../interfaces/messagable";
import { Scene } from "../scene";
import { TokenDataBase } from "./token_data";

type Attributes = {
    _container: {
        position: {
            x: number;
            y: number;
        };
        width: number;
        height: number;
    };
    scene_uid: string;
};

export class Token extends BaseEntity<Attributes> {
    protected _container: ContainerExtension;
    protected _scene: Scene;
    protected _tokenData: TokenDataBase<any>;

    public constructor(
        container: ContainerExtension,
        scene: Scene,
        tokenData: TokenDataBase<any>,
    ) {
        super();

        this._scene = scene;
        this._container = container;
        this._tokenData = tokenData;
        this.container.dragEndCallback = this.dragCallback.bind(this);
    }

    public get container(): ContainerExtension {
        return this._container;
    }

    public get scene(): Scene {
        return this._scene;
    }

    public set scene(value: Scene) {
        this._scene = value;
    }

    public getAttributes(): Attributes {
        return {
            _container: {
                position: {
                    x: this._container.position.x,
                    y: this._container.position.y,
                },
                width: this._container.width,
                height: this._container.height,
            },
            scene_uid: this.scene.getUId(),
        };
    }

    public dragCallback(): void {
        GBoard.websocket.emit("action", this);
    }

    public applyChanges(changes: TypedJson<Attributes>): void {
        super.applyChanges(changes);
        this._container.position.x = changes._container.position.x;
        this._container.position.y = changes._container.position.y;
        this._container.width = changes._container.width;
        this._container.height = changes._container.height;
    }
}
