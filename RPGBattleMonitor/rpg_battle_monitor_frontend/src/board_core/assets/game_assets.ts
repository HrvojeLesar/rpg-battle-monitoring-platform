import {
    DeleteAction,
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "../interfaces/messagable";
import newUId from "../utils/uuid_generator";

export type GameAssetsAttributes = {};

export class GameAssets implements IMessagable<GameAssetsAttributes> {
    private _uid: UId;
    protected _lastChangesTimestamp: Maybe<number> = undefined;

    public constructor(attributes?: GameAssetsAttributes) {
        this._uid = newUId();
    }

    public static getKindStatic(): string {
        return this.name;
    }

    public getKind(): string {
        return this.constructor.name;
    }

    public getUId(): UId {
        return this._uid;
    }

    public setUId(uid: UId): void {
        this._uid = uid;
    }

    public toJSON(): TypedJson<GameAssetsAttributes> {
        return {
            ...this.getAttributes(),
            kind: this.getKind(),
            uid: this.getUId(),
            timestamp: Date.now(),
        };
    }

    public getAttributes(): GameAssetsAttributes {
        return {};
    }

    public applyUpdateAction(changes: TypedJson<GameAssetsAttributes>): void {
        this._uid = changes.uid;
    }

    public deleteAction(action: DeleteAction): void {
        action.acc.push(this);
    }

    public getLastChangesTimestamp(): Maybe<number> {
        return this._lastChangesTimestamp;
    }

    public shouldApplyChanges(
        changes: TypedJson<GameAssetsAttributes>,
    ): boolean {
        return shouldApplyChanges(this, changes);
    }
}
