import {
    DeleteAction,
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "@/board_core/interfaces/messagable";
import newUId from "@/board_core/utils/uuid_generator";
import { RpgTokenData } from "../tokens/rpg_token_data";
import { GBoard } from "@/board_core/board";
import { RpgScene } from "../scene/scene";

export type TurnOrderAttributes = {
    tokenUIds: UId[];
    sceneUid: UId;
};

function convertUIdsToTokens(tokens: UId[]): RpgTokenData[] {
    return (
        tokens.reduce<RpgTokenData[]>((acc, tokenUId) => {
            const token = GBoard.entityRegistry.entities.get(tokenUId);
            if (token instanceof RpgTokenData) {
                acc.push(token);
            }
            return acc;
        }, []) ?? []
    );
}

export class TurnOrder implements IMessagable<TurnOrderAttributes> {
    protected _uid: UId;
    protected _lastChangesTimestamp: Maybe<number> = undefined;
    protected _tokens: RpgTokenData[] = [];
    public readonly scene: RpgScene;

    public constructor(scene: RpgScene, options: TurnOrderAttributes) {
        this._uid = newUId();
        this.scene = scene;

        this._tokens = convertUIdsToTokens(options?.tokenUIds ?? []);
    }

    public getKind(): string {
        return this.constructor.name;
    }

    public getUId(): UId {
        return this._uid;
    }

    public setUId(uid: UId) {
        this._uid = uid;
    }

    public toJSON(): TypedJson<TurnOrderAttributes> {
        return {
            ...this.getAttributes(),
            kind: this.getKind(),
            uid: this.getUId(),
            timestamp: Date.now(),
        };
    }

    public getAttributes(): TurnOrderAttributes {
        return {
            tokenUIds: this._tokens.map((token) => token.getUId()),
            sceneUid: this.scene.getUId(),
        };
    }

    public applyUpdateAction(changes: TypedJson<TurnOrderAttributes>): void {
        this._tokens = convertUIdsToTokens(changes.tokenUIds);
    }

    public deleteAction(action: DeleteAction): void {
        action.acc.push(this);
    }

    public getLastChangesTimestamp(): Maybe<number> {
        return this._lastChangesTimestamp;
    }

    public shouldApplyChanges(
        changes: TypedJson<TurnOrderAttributes>,
    ): boolean {
        return shouldApplyChanges(this, changes);
    }

    public get tokens(): RpgTokenData[] {
        return this._tokens;
    }

    public addToken(token: RpgTokenData): void {
        this._tokens.push(token);
    }

    public removeToken(token: RpgTokenData): void {
        this._tokens = this._tokens.filter((t) => t !== token);
    }

    public static getKindStatic(): string {
        return this.name;
    }
}
