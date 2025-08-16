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
        console.log(JSON.stringify(this));
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
            type: this.getType(),
            uid: this.getUId(),
        };
    }

    public getType(): string {
        return "Token";
    }

    public getUId(): string {
        return this._uid;
    }

    public getAttributes(): Record<string, unknown> {
        return {};
    }
}
