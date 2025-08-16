import { IMessagable, type TypedJson } from "../interfaces/messagable";
import newUId from "../utils/uuid_generator";

export class TokenDataBase implements IMessagable {
    protected _uid: string;

    public constructor(uid?: string) {
        this._uid = uid ?? newUId();
    }

    public getAttributes(): Record<string, unknown> {
        return {};
    }

    public getType(): string {
        return "TokenData";
    }

    public getUId(): string {
        return this._uid;
    }

    public toJSON(): TypedJson {
        return {
            ...this.getAttributes(),
            type: this.getType(),
            uid: this.getUId(),
        };
    }
}
