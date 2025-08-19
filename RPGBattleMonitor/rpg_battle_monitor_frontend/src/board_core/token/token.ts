import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";
import { Grid } from "../grid/grid";
import { IMessagable, type TypedJson } from "../interfaces/messagable";
import { Scene } from "../scene";
import newUId from "../utils/uuid_generator";
import { TokenDataBase } from "./token_data";

export class Token implements IMessagable {
    protected _container: ContainerExtension;
    protected _grid: Grid;
    protected _scene?: Scene;
    protected _tokenData: IMessagable;
    protected _uid: string;

    public constructor(
        container: ContainerExtension,
        grid: Grid,
        tokenData?: IMessagable,
        uid?: string,
    ) {
        this._container = container;
        this._grid = grid;
        this._uid = uid ?? newUId();
        this._tokenData = tokenData ?? new TokenDataBase();
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

    public getAttributes(): Record<string, unknown> {
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

    public applyChanges(changes: Record<string, unknown>): void {
        this._container.position.x = changes._container?.position?.x;
        this._container.position.y = changes._container?.position?.y;
    }
}
