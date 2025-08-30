import { GBoard } from "../board";
import { BaseEntity } from "../entity/base_entity";
import { ContainerExtension } from "../extensions/container_extension";
import { type TypedJson } from "../interfaces/messagable";
import { Scene } from "../scene";
import { TokenDataBase } from "./token_data";

export type TokenAttributes = {
    sceneUid: string;
    tokenData: string;
    containerUid: string;
};

export class Token extends BaseEntity<TokenAttributes> {
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

        this._scene.addDependant(this);
        this._tokenData.addDependant(this);
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

    public getAttributes(): TokenAttributes {
        return {
            containerUid: this._container.getUId(),
            sceneUid: this.scene.getUId(),
            tokenData: this._tokenData.getUId(),
        };
    }

    public dragCallback(): void {
        GBoard.websocket.queue(this._container, "updateQueue");
    }

    public applyUpdateAction(changes: TypedJson<TokenAttributes>): void {
        super.applyUpdateAction(changes);
    }

    public deleteAction(): void {
        GBoard.websocket.socket.emit("delete", this);
        this._container.deleteAction();
    }
}
