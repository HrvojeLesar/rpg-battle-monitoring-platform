import { IMessagable, TypedJson } from "../interfaces/messagable";
import newUId from "../utils/uuid_generator";

export abstract class BaseEntity<T = unknown> implements IMessagable<T> {
    protected _uid: string;

    public constructor() {
        this._uid = newUId();
    }

    public set uid(uid: string) {
        this._uid = uid;
    }

    public get uid(): string {
        return this._uid;
    }

    public getKind(): string {
        return this.constructor.name;
    }

    abstract getAttributes(): T;
    abstract applyChanges(changes: T): void;

    public getUId(): string {
        return this._uid;
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
}
