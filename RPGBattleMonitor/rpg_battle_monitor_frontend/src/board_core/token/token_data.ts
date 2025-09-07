import {
    DefaultAttributes,
    DeleteAction,
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "../interfaces/messagable";
import newUId from "../utils/uuid_generator";

export abstract class TokenDataBase<T = DefaultAttributes>
    implements IMessagable<T>
{
    protected _uid: UId;
    protected _lastChangesTimestamp: Maybe<number> = undefined;

    public constructor() {
        this._uid = newUId();
    }

    public set uid(uid: UId) {
        this._uid = uid;
    }

    public get uid(): UId {
        return this._uid;
    }

    public getKind(): string {
        return this.constructor.name;
    }

    public abstract getAttributes(): T;
    public applyUpdateAction(changes: TypedJson<T>): void {
        this._uid = changes.uid;
    }

    public getUId(): UId {
        return this._uid;
    }

    public setUId(uid: UId) {
        this._uid = uid;
    }

    public toJSON(): TypedJson<T> {
        return {
            ...this.getAttributes(),
            kind: this.getKind(),
            uid: this.getUId(),
            timestamp: Date.now(),
        };
    }

    public static getKindStatic(): string {
        return this.name;
    }

    public abstract deleteAction(action: DeleteAction): void;

    public getLastChangesTimestamp(): Maybe<number> {
        return this._lastChangesTimestamp;
    }

    public shouldApplyChanges(changes: TypedJson<T>): boolean {
        return shouldApplyChanges(this, changes);
    }
}
