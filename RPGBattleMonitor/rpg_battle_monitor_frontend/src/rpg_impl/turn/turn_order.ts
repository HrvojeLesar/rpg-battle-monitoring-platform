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
import { Action, ActionCallbacks } from "../actions/action";
import { notifications } from "@mantine/notifications";
import {
    anotherTokensTurnNotification,
    errorNotification,
    infoNotification,
} from "../utils/notification_utils";
import { HealthState } from "../characters_stats/health_state";

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
    baseSpeed: number;
    speed: number;
    action: number;
    bonusAction: number;
};

export type TurnOrderEntry = {
    token: RpgToken;
    initiative: number;
    surprised: boolean;
    baseSpeed: number;
    speed: number;
    action: number;
    bonusAction: number;
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
                    baseSpeed: entry.baseSpeed,
                    speed: entry.speed,
                    action: entry.action,
                    bonusAction: entry.bonusAction,
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
                baseSpeed: entry.baseSpeed,
                speed: entry.speed,
                action: entry.action,
                bonusAction: entry.bonusAction,
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

    public get actionableTokens(): Readonly<TurnOrderEntry[]> {
        return this._tokens.filter(
            (entry) =>
                entry.token.tokenData.healthState !== HealthState.Dead &&
                entry.token.tokenData.healthState !== HealthState.Stabilized,
        );
    }

    // TODO: logic for adding tokens during combat
    public addToken(token: RpgToken | RpgToken[]): void {
        if (this.isInCombat()) {
            notifications.show(
                errorNotification(
                    "Combat is already in progress",
                    "Cannot add tokens to encounter during combat",
                ),
            );

            return;
        }

        const tokens = Array.isArray(token) ? token : [token];

        tokens
            .filter((token) => !this.isTokenInTurnOrder(token))
            .forEach((token) => {
                this._tokens.push({
                    token,
                    initiative: 0,
                    surprised: false,
                    baseSpeed: token.tokenData.speed.walk,
                    speed: token.tokenData.speed.walk, // TODO: get speed from the current token state and apply modifiers
                    action: 1,
                    bonusAction: 1,
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

        if (this.areAllTokensOutOfAction()) {
            notifications.show(
                infoNotification("Stoping combat", "No token can act"),
            );
            this.stopCombat();
            return;
        }

        this.rollInitiative();

        for (let idx = 0; idx < this._tokens.length; idx++) {
            const entry = this._tokens[idx];
            if (this.isActionable(entry)) {
                break;
            }
            entry.surprised = false;
            this.tokenIdxOnTurn = this.nextTokenIdxOnTurn();
        }

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
            this.resetEntryVars(entry);
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

        this.tokenIdxOnTurn = this.nextTokenIdxOnTurn();
        this.turnCount++;

        const nextToken = this.tokens.at(this.tokenIdxOnTurn);
        if (nextToken !== undefined) {
            this.processEntryNextTurn(nextToken);
        }

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }

    public isInCombat(): boolean {
        return this._state === TurnOrderState.InCombat;
    }

    public isOnTurn(token: RpgToken): boolean {
        return (
            this._state === TurnOrderState.InCombat &&
            this.tokens.at(this.tokenIdxOnTurn)?.token === token
        );
    }

    public getToken(token: RpgToken): Maybe<TurnOrderEntry> {
        return this._tokens.find((entry) => entry.token === token);
    }

    public getTokenOnTurn(): Maybe<TurnOrderEntry> {
        return this._tokens.at(this.tokenIdxOnTurn);
    }

    protected processEntryNextTurn(nextToken: TurnOrderEntry): void {
        this.resetEntryVars(nextToken);

        if (nextToken.surprised) {
            notifications.show(
                infoNotification(
                    "Skipping token",
                    `${nextToken.token.tokenData.name} is surprised, skipping turn`,
                ),
            );
            nextToken.surprised = false;
            this.nextTurn();
        }

        if (this.areAllTokensOutOfAction()) {
            notifications.show(
                infoNotification("Stoping combat", "No token can act"),
            );
            this.stopCombat();
        }

        if (
            nextToken.token.tokenData.healthState === HealthState.Dead &&
            !this.areAllTokensOutOfAction()
        ) {
            this.nextTurn();
        }

        if (!this.isActionable(nextToken)) {
            this.nextTurn();
        }
    }

    public doAction(
        token: RpgToken,
        action: Action,
        callbacks?: ActionCallbacks,
        otherData?: any,
    ): void {
        if (this.isInCombat() && !this.isDoActionValid(token, action)) {
            return;
        }

        if (
            action.targeting.includes("self") ||
            action.targeting.includes("ally") ||
            action.targeting.includes("hostile")
        ) {
            this.scene.targetSelectionHandler.doAction(token, action, {
                ...callbacks,
                onFinished: (initiator, target, action) => {
                    const entry = this.getToken(token);
                    if (entry !== undefined) {
                        if (action.actionType === "action") {
                            entry.action--;
                        } else if (action.actionType === "bonusAction") {
                            entry.bonusAction--;
                        }
                    }

                    callbacks?.onFinished?.(initiator, target, action);
                },
            });
        } else {
            action.doAction(
                token,
                token,
                undefined,
                {
                    ...callbacks,
                    onFinished: (initiator, target, action) => {
                        const entry = this.getToken(token);
                        if (entry !== undefined) {
                            if (action.actionType === "action") {
                                entry.action--;
                            } else if (action.actionType === "bonusAction") {
                                entry.bonusAction--;
                            }
                        }

                        callbacks?.onFinished?.(initiator, target, action);
                    },
                },
                otherData,
            );
        }
    }

    protected isDoActionValid(token: RpgToken, action: Action): boolean {
        if (!this.isOnTurn(token)) {
            anotherTokensTurnNotification();
            return false;
        }

        const entry = this.getToken(token);
        if (entry === undefined) {
            notifications.show(
                errorNotification(
                    "Token not in turn order",
                    "Token using the action is not in the current turn order",
                ),
            );
            return false;
        }

        if (entry.action <= 0 && action.actionType === "action") {
            notifications.show(
                errorNotification(
                    "Not enough actions",
                    "Token does not have enough actions to perform this action",
                ),
            );
            return false;
        }

        if (entry.bonusAction <= 0 && action.actionType === "bonusAction") {
            notifications.show(
                errorNotification(
                    "Not enough bonus actions",
                    "Token does not have enough bonus actions to perform this action",
                ),
            );
            return false;
        }

        return true;
    }

    protected resetEntryVars(entry: TurnOrderEntry): void {
        entry.speed = entry.baseSpeed;
        entry.action = 1;
        entry.bonusAction = 1;
    }

    public clear(): void {
        this.removeToken(this._tokens.map((entry) => entry.token));

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }

    public nextTokenIdxOnTurn(): number {
        return (this.tokenIdxOnTurn + 1) % this._tokens.length;
    }

    protected areAllTokensOutOfAction(): boolean {
        return this._tokens.every(
            (entry) =>
                entry.token.tokenData.healthState === HealthState.Dead ||
                entry.token.tokenData.healthState === HealthState.Stabilized,
        );
    }

    public isActionable(entry: TurnOrderEntry): boolean {
        return (
            !entry.surprised &&
            !(
                entry.token.tokenData.healthState === HealthState.Dead ||
                entry.token.tokenData.healthState === HealthState.Stabilized
            )
        );
    }
}

// TODO: Extract out and make generic, also notify others about rolls
function roll(): number {
    return Math.floor(Math.random() * 21);
}
