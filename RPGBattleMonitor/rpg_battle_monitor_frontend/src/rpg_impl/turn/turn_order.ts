import {
    DeleteAction,
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "@/board_core/interfaces/messagable";
import newUId from "@/board_core/utils/uuid_generator";
import { GBoard } from "@/board_core/board";
import { RpgScene } from "../scene/scene";
import { RpgToken } from "../tokens/rpg_token";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { turnOrderAtoms } from "../stores/turn_order_store";

export type TurnOrderAttributes = {
    tokenUIds: UId[];
    sceneUid: UId;
};

export type TurnOrderEntry = {
    token: RpgToken;
    initiative: number;
};

function convertUIdsToTokens(tokens: UId[]): RpgToken[] {
    return (
        tokens.reduce<RpgToken[]>((acc, tokenUId) => {
            const token = GBoard.entityRegistry.entities.get(tokenUId);
            if (token instanceof RpgToken) {
                acc.push(token);
            }
            return acc;
        }, []) ?? []
    );
}

export class TurnOrder implements IMessagable<TurnOrderAttributes> {
    protected _uid: UId;
    protected _lastChangesTimestamp: Maybe<number> = undefined;
    protected _tokens: TurnOrderEntry[] = [];
    public readonly scene: RpgScene;

    public constructor(scene: RpgScene, options?: TurnOrderAttributes) {
        this._uid = newUId();
        this.scene = scene;

        const rpgTokens = convertUIdsToTokens(options?.tokenUIds ?? []).map(
            (token) => ({
                token,
                initiative: 0,
            }),
        );

        this._tokens = rpgTokens;
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
            tokenUIds: this._tokens.map((entry) => entry.token.getUId()),
            sceneUid: this.scene.getUId(),
        };
    }

    public applyUpdateAction(changes: TypedJson<TurnOrderAttributes>): void {
        this._uid = changes.uid;
        this.addToken(convertUIdsToTokens(changes.tokenUIds));
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

    public get tokens(): Readonly<TurnOrderEntry[]> {
        return this._tokens;
    }

    public addToken(token: RpgToken | RpgToken[]): void {
        const tokens = Array.isArray(token) ? token : [token];

        tokens
            .filter((token) => !this.isTokenInTurnOrder(token))
            .forEach((token) => {
                this._tokens.push({
                    token,
                    initiative: 0,
                });
            });

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }

    public removeToken(token: RpgToken | RpgToken[]): void {
        const tokens = Array.isArray(token) ? token : [token];

        this._tokens = this._tokens.filter(
            (entry) => !tokens.includes(entry.token),
        );

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }

    public isTokenInTurnOrder(token: RpgToken): boolean {
        return this._tokens.some((entry) => entry.token === token);
    }

    public static getKindStatic(): string {
        return this.name;
    }

    public startCombat(): void {
        // 1. Determine surprise -- DM will mark manually
        // 2. Establish positions -- skip because tokens are already positioned
        // 3. Roll initiative
        // 4. Take turn
        // 5. Begin next round
    }

    protected rollInitiative(): void {}
}
