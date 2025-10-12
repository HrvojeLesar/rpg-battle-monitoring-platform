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

export type TargetingType = "self" | "ally" | "hostile";
export type AreaOfEffectType = "line" | "cone" | "cube" | "sphere" | "cylinder";
export type ActionType = "action" | "bonusAction";

export type ActionOnFinished = (
    initiator: RpgToken,
    target: ITargetable | ITargetable[],
    action: Action,
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

export type ActionOnCanceled = (initiator: RpgToken, action: Action) => void;

export type ActionOptions = {
    baseDamage: string;
    rangeFt: number;
    damageType: string;
    targeting: TargetingType[];
    areaOfEffect?: AreaOfEffectType;
    actionType?: ActionType;
};

export abstract class Action {
    public baseDamage: string;
    public rangeFt: number;
    public damageType: string;
    public targeting: TargetingType[];
    public areaOfEffect?: AreaOfEffectType;
    public actionType: ActionType = "action";

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

        this.die = GDieParser.parse(this.baseDamage);
    }

    public rollDamage(options?: RollOptions): Rolls {
        return this.die.roll(options);
    }

    public get cellRange(): number {
        return this.rangeFt / 5;
    }

    public attackRoll(options?: RollOptions): Rolls {
        return GD20.roll(options);
    }

    public abstract damageTarget(
        attacker: RpgToken,
        target: ITargetable | ITargetable[],
    ): ITargetable[];

    protected getSingleTargetAttackDamage(
        _attacker: RpgToken,
        target: ITargetable,
    ): Partial<SingleTargetAttackDamage> {
        // TODO: Read lucky value from some other place
        const attackRollResults = this.attackRoll({
            isLucky: false,
        });
        printRolls("Attack rolls", attackRollResults);

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
        onFinished?: ActionOnFinished,
    ): void;
}
