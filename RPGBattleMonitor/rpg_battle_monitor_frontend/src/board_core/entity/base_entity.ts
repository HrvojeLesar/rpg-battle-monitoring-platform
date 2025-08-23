import {
    DefaultAttributes,
    IMessagable,
    TypedJson,
    UId,
} from "../interfaces/messagable";
import newUId from "../utils/uuid_generator";

export abstract class BaseEntity<T = DefaultAttributes>
    implements IMessagable<T>
{
    protected _uid: UId;

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
    public applyChanges(changes: TypedJson<T>): void {
        this._uid = changes.uid;
    }

    public getUId(): UId {
        return this._uid;
    }

    public toJSON(): TypedJson<T> {
        return {
            ...this.getAttributes(),
            kind: this.getKind(),
            uid: this.getUId(),
            timestamp: Date.now(),
        };
    }
}
