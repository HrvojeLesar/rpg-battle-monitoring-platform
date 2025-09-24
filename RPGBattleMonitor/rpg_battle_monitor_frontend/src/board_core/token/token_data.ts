import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import {
    DeleteAction,
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "../interfaces/messagable";
import newUId from "../utils/uuid_generator";
import { tokenAtoms } from "@/board_react_wrapper/stores/token_store";
import { GBoard } from "../board";
import { Token } from "./token";

export type TokenDataBaseAttributes = {
    image: Maybe<string>;
};

export abstract class TokenDataBase<
    T extends TokenDataBaseAttributes = TokenDataBaseAttributes,
> implements IMessagable<T>
{
    protected _uid: UId;
    protected _lastChangesTimestamp: Maybe<number> = undefined;
    protected _image: Maybe<string> = undefined;

    public constructor(options?: Partial<T>) {
        this._uid = newUId();

        this._image = options?.image;
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

    public getAttributes(): T {
        return {
            image: this._image,
        } as T;
    }

    public applyUpdateAction(changes: TypedJson<T>): void {
        this._uid = changes.uid;
        this.image = changes.image;

        GAtomStore.set(tokenAtoms.refreshTokens);
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

    public deleteAction(action: DeleteAction): void {
        action.acc.push(this as IMessagable);

        const tokens = this.getAssoicatedTokens();

        for (const token of tokens) {
            token.deleteAction(action);
        }

        GAtomStore.set(tokenAtoms.refreshTokens);
    }

    public getLastChangesTimestamp(): Maybe<number> {
        return this._lastChangesTimestamp;
    }

    public shouldApplyChanges(changes: TypedJson<T>): boolean {
        return shouldApplyChanges(this, changes);
    }

    public get image(): Maybe<string> {
        return this._image;
    }

    public set image(image: Maybe<string>) {
        this._image = image;

        const tokens = this.getAssoicatedTokens();
        tokens.forEach((token) => {
            token.setTexture();
        });
    }

    public getAssoicatedTokens(): Token[] {
        return GBoard.entityRegistry.entities.list(
            (entity) => entity instanceof Token && entity.tokenData === this,
        ) as Token[];
    }
}
