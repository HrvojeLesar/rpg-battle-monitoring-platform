import { FederatedPointerEvent } from "pixi.js";
import {
    HOSTILE_NPC_TAG,
    PARTY_TAG,
    SPECIAL_NPC_HOSTILE_TAG,
} from "../characters_stats/tags";
import { ITargetable } from "../interface/targetable";
import { Die, GD20, printRolls, RollOptions, Rolls } from "../rolls/dice";
import { GDieParser } from "../rolls/die_parser";
import { RpgToken } from "../tokens/rpg_token";
import { RpgTokenData } from "../tokens/rpg_token_data";
import { HealthState } from "../characters_stats/health_state";
import { AbilityScoreType } from "../characters_stats/ability_score";

export type TargetingType = "self" | "ally" | "hostile";
export type AreaOfEffectType = "line" | "cone" | "cube" | "sphere" | "cylinder";
export type ActionType = "action" | "bonusAction";

export type DamageResult = {
    target: ITargetable;
    damage: Partial<SingleTargetAttackDamage>;
};

export type ApplyDamageCallback = (
    damageResults: DamageResult[],
    applyDamage: () => void,
) => void;

export type ApplyDamageResult = {
    damageResults: DamageResult[];
    applyDamage: () => ITargetable[];
};

export type ActionCallbacks<T = DamageResult[]> = {
    onFinished?: ActionOnFinished<T>;
    onCanceled?: ActionOnCanceled<T>;
    onAttackRollCallback?: (
        attackRollResults: Rolls,
        initiator: RpgToken,
        target: ITargetable,
    ) => void;
    onDamageRollCallback?: (
        damageRollResults: Rolls,
        initiator: RpgToken,
        target: ITargetable,
    ) => void;
    onTargetDamageCallback?: (initiator: RpgToken, targets: T) => void;
    actCallback?: (damageResults: T, act: () => void) => void;
};

export type ActionOnFinished<T> = (
    initiator: RpgToken,
    target: ITargetable | ITargetable[],
    action: Action<T>,
    data?: {
        descriminator: string;
        values: unknown;
    },
) => void;

export type SingleTargetAttackDamage = {
    damage: Maybe<number>;
    isCritical: Maybe<boolean>;
    isCriticalFailure: Maybe<boolean>;
    isMiss: Maybe<boolean>;
    attackRolls: Rolls;
    damageRolls: Maybe<Rolls>;
};

export type ActionOnCanceled<T> = (
    initiator: RpgToken,
    action: Action<T>,
) => void;

export type ActionOptions = {
    baseDamage: string;
    rangeFt: number | string;
    damageType: string;
    targeting: TargetingType[];
    areaOfEffect?: AreaOfEffectType;
    actionType?: ActionType;
    properties?: string[];
};

export abstract class Action<T = DamageResult[], D = undefined> {
    public baseDamage: string;
    public rangeFt: number | string;
    public damageType: string;
    public targeting: TargetingType[];
    public areaOfEffect?: AreaOfEffectType;
    public actionType: ActionType = "action";
    public abilityScoreModifierType: AbilityScoreType =
        AbilityScoreType.Strength;
    public properties: string[];

    protected die: Die;

    public constructor(options: ActionOptions) {
        this.baseDamage = options.baseDamage;
        this.rangeFt = options.rangeFt;
        this.damageType = options.damageType;
        this.targeting = options.targeting;
        this.areaOfEffect = options.areaOfEffect;
        if (options.actionType) {
            this.actionType = options.actionType;
        }

        this.properties = options.properties ?? [];

        this.die = GDieParser.parse(this.baseDamage);
    }

    public rollDamage(options?: RollOptions): Rolls {
        return this.die.roll(options);
    }

    public get cellRange(): number {
        if (typeof this.rangeFt === "string") {
            const maxRange = this.rangeFt.split("/")[1];

            return parseInt(maxRange) / 5;
        }

        return this.rangeFt / 5;
    }

    public attackRoll(options?: RollOptions): Rolls {
        return GD20.roll(options);
    }

    public abstract damageTarget(
        attacker: RpgToken,
        target: ITargetable | ITargetable[],
        callbacks?: ActionCallbacks<T>,
    ): ITargetable[] | ApplyDamageResult;

    protected getSingleTargetAttackDamage(
        attacker: RpgToken,
        target: ITargetable,
        callbacks?: ActionCallbacks<T>,
    ): Partial<SingleTargetAttackDamage> {
        // TODO: Read lucky value from some other place
        const attackRollResults = this.attackRoll({
            modifier: attacker.tokenData.getAttackModifier(this),
            isLucky: false,
        });
        printRolls("Attack rolls", attackRollResults);

        callbacks?.onAttackRollCallback?.(attackRollResults, attacker, target);

        const attackRoll = attackRollResults.rolls[0];
        if (attackRoll.isCritialFailure) {
            return {
                attackRolls: attackRollResults,
                isCriticalFailure: true,
            };
        }

        if (
            target instanceof RpgToken &&
            attackRoll.value < target.tokenData.armorClass
        ) {
            return {
                attackRolls: attackRollResults,
                isMiss: true,
            };
        }

        const damageRoll = this.rollDamage({
            isCritical: attackRoll.isCriticalSuccess,
        });
        printRolls("Damage rolls", damageRoll);

        callbacks?.onDamageRollCallback?.(attackRollResults, attacker, target);

        const baseDamage = damageRoll.rolls.reduce<number>((acc, roll) => {
            acc += roll.value;

            return acc;
        }, 0);

        return {
            // TODO: apply modifier, currently 0
            damage: baseDamage + 0,
            isCritical: attackRoll.isCriticalSuccess,
            attackRolls: attackRollResults,
            damageRolls: damageRoll,
        };
    }

    public filterTargets(
        attacker: RpgToken,
        targets: ITargetable[],
    ): ITargetable[] {
        if (this.targeting.length === 0) {
            return targets;
        }

        let filteredTargets: ITargetable[] = [];

        for (const targeting of this.targeting) {
            let result: ITargetable[] = [];
            switch (targeting) {
                case "ally":
                    result = this.targetFriendly(attacker, targets);
                    break;
                case "hostile":
                    result = this.targetHostile(attacker, targets);
                    break;
                case "self":
                    result = this.targetSelf(attacker);
                    break;
            }

            filteredTargets = [...filteredTargets, ...result];
        }

        return [...new Set(filteredTargets)];
    }

    public targetHostile(attacker: RpgToken, targets: ITargetable[]) {
        return targets.filter((target) => {
            return (
                target instanceof RpgToken &&
                this.isHostile(attacker.tokenData, target.tokenData) &&
                target.tokenData.healthState !== HealthState.Dead
            );
        });
    }

    public targetFriendly(attacker: RpgToken, targets: ITargetable[]) {
        return targets.filter((target) => {
            return (
                target instanceof RpgToken &&
                !this.isHostile(attacker.tokenData, target.tokenData) &&
                target.tokenData.healthState !== HealthState.Dead
            );
        });
    }

    public targetSelf(self: RpgToken): ITargetable[] {
        return [self];
    }

    public isHostile(attacker: RpgTokenData, other: RpgTokenData): boolean {
        let hostileTargetTags = [SPECIAL_NPC_HOSTILE_TAG, HOSTILE_NPC_TAG];
        const attackerAlignment =
            attacker.tags.find(
                (tag) =>
                    tag === PARTY_TAG ||
                    tag === SPECIAL_NPC_HOSTILE_TAG ||
                    tag === HOSTILE_NPC_TAG,
            ) ?? HOSTILE_NPC_TAG;
        if (
            attackerAlignment === SPECIAL_NPC_HOSTILE_TAG ||
            attackerAlignment === HOSTILE_NPC_TAG
        ) {
            hostileTargetTags = [PARTY_TAG];
        }

        for (const tag of hostileTargetTags) {
            if (other.tags.includes(tag)) {
                return true;
            }
        }

        return false;
    }

    public abstract doAction(
        target: RpgToken,
        initiator: RpgToken,
        event?: FederatedPointerEvent,
        callbacks?: ActionCallbacks<T>,
        otherData?: D,
    ): void;
}
