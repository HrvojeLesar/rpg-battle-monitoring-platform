import { GBoard } from "../board";
import { BaseEntity } from "../entity/base_entity";
import { ContainerExtension } from "../extensions/container_extension";
import { Grid } from "../grid/grid";
import { type TypedJson } from "../interfaces/messagable";
import { Scene } from "../scene";
import newUId from "../utils/uuid_generator";
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
};

export class Token extends BaseEntity<Attributes> {
    protected _container: ContainerExtension;
    protected _grid: Grid;
    protected _scene?: Scene;
    protected _tokenData: TokenDataBase;
    protected _uid: string;

    public constructor(
        container: ContainerExtension,
        grid: Grid,
        tokenData: TokenDataBase,
        uid?: string,
    ) {
        super();

        this._container = container;
        this._grid = grid;
        this._uid = uid ?? newUId();
        this._tokenData = tokenData;
        this.container.dragEndCallback = this.dragCallback.bind(this);
    }

    public get container(): ContainerExtension {
        return this._container;
    }

    public get scene(): Maybe<Scene> {
        return this._scene;
    }

    public set scene(value: Maybe<Scene>) {
        this._scene = value;
    }

    public toJSON(): TypedJson {
        return {
            ...this.getAttributes(),
            kind: this.getKind(),
            uid: this.getUId(),
            timestamp: Date.now(),
            game: 0,
        };
    }

    public getKind(): string {
        return "Token";
    }

    public getUId(): string {
        return this._uid;
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
        };
    }

    public dragCallback(): void {
        GBoard.websocket.emit("action", this);
    }

    public applyChanges(changes: Attributes): void {
        this._container.position.x = changes._container.position.x;
        this._container.position.y = changes._container.position.y;
        this._container.width = changes._container.width;
        this._container.height = changes._container.height;
    }
}
