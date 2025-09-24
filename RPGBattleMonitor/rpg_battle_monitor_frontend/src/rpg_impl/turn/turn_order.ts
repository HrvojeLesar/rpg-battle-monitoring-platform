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
import {
    abilityScoreModifier,
    AbilityScoreType,
} from "../characters_stats/ability_score";

export enum TurnOrderState {
    OutOfCombat = "OutOfCombat",
    InCombat = "InCombat",
}

export type TurnOrderAttributes = {
    tokenUIds: TurnOrderEntrySerialized[];
    sceneUid: UId;
    turnOrderState: TurnOrderState;
    turnCount: number;
    tokenIdxOnTurn: number;
};

export type TurnOrderEntrySerialized = {
    token: UId;
    initiative: number;
    surprised: boolean;
};

export type TurnOrderEntry = {
    token: RpgToken;
    initiative: number;
    surprised: boolean;
};

function convertUIdsToTokens(
    tokens: TurnOrderEntrySerialized[],
): TurnOrderEntry[] {
    return (
        tokens.reduce<TurnOrderEntry[]>((acc, entry) => {
            const token = GBoard.entityRegistry.entities.get(entry.token);
            if (token instanceof RpgToken) {
                acc.push({
                    token,
                    initiative: entry.initiative,
                    surprised: entry.surprised,
                });
            }
            return acc;
        }, []) ?? []
    );
}

export class TurnOrder implements IMessagable<TurnOrderAttributes> {
    protected _uid: UId;
    protected _lastChangesTimestamp: Maybe<number> = undefined;
    protected _tokens: TurnOrderEntry[] = [];
    protected _state: TurnOrderState;
    public readonly scene: RpgScene;
    public turnCount: number = 0;
    public tokenIdxOnTurn: number = 0;

    public constructor(scene: RpgScene, options?: TurnOrderAttributes) {
        this._uid = newUId();
        this.scene = scene;

        const rpgTokens = convertUIdsToTokens(options?.tokenUIds ?? []);

        this._tokens = rpgTokens;
        this._state = options?.turnOrderState ?? TurnOrderState.OutOfCombat;
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
            tokenUIds: this._tokens.map((entry) => ({
                token: entry.token.getUId(),
                initiative: entry.initiative,
                surprised: entry.surprised,
            })),
            sceneUid: this.scene.getUId(),
            turnOrderState: this._state,
            turnCount: this.turnCount,
            tokenIdxOnTurn: this.tokenIdxOnTurn,
        };
    }

    public applyUpdateAction(changes: TypedJson<TurnOrderAttributes>): void {
        this._uid = changes.uid;
        this._tokens = convertUIdsToTokens(changes.tokenUIds);
        this._state = changes.turnOrderState;
        this.turnCount = changes.turnCount;
        this.tokenIdxOnTurn = changes.tokenIdxOnTurn;

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
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

    // TODO: logic for adding tokens during combat
    public addToken(token: RpgToken | RpgToken[]): void {
        const tokens = Array.isArray(token) ? token : [token];

        tokens
            .filter((token) => !this.isTokenInTurnOrder(token))
            .forEach((token) => {
                this._tokens.push({
                    token,
                    initiative: 0,
                    surprised: false,
                });
            });

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }

    // TODO: logic for removing tokens during combat
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

    protected nextState(): void {
        switch (this._state) {
            case TurnOrderState.OutOfCombat:
                this._state = TurnOrderState.InCombat;
                break;
            case TurnOrderState.InCombat:
                this._state = TurnOrderState.OutOfCombat;
                break;
        }
    }

    public startCombat(): void {
        if (this._state === TurnOrderState.OutOfCombat) {
            this.nextState();
        } else {
            return;
        }

        this.rollInitiative();

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }

    protected rollInitiative(): void {
        this._tokens.forEach((entry) => {
            const rolled = roll();
            const dexterityAbilityScore =
                entry.token.tokenData.abilityScore.dexterity;
            const dexModifier = abilityScoreModifier(
                dexterityAbilityScore.score,
                AbilityScoreType.Dexterity,
            );
            entry.initiative = rolled + dexModifier;
        });

        this._tokens.sort((a, b) => {
            return b.initiative - a.initiative;
        });

        this.tokenIdxOnTurn = 0;
        this.turnCount = 0;
    }

    public stopCombat(): void {
        if (this._state === TurnOrderState.InCombat) {
            this.nextState();
        } else {
            return;
        }

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }

    public get state(): TurnOrderState {
        return this._state;
    }

    public nextTurn(): void {
        if (this._state !== TurnOrderState.InCombat) {
            return;
        }

        this.tokenIdxOnTurn = (this.tokenIdxOnTurn + 1) % this._tokens.length;
        this.turnCount++;

        const nextToken = this.tokens.at(this.tokenIdxOnTurn);
        if (nextToken?.surprised) {
            nextToken.surprised = false;
            this.nextTurn();
        }

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }
}

// TODO: Extract out and make generic, also notify others about rolls
function roll(): number {
    return Math.floor(Math.random() * 21);
}
