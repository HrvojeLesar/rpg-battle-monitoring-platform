import { ITargetable } from "../interface/targetable";
import { Die, GD20, printRolls, RollOptions, Rolls } from "../rolls/dice";
import { GDieParser } from "../rolls/die_parser";
import { RpgToken } from "../tokens/rpg_token";

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

    protected getSingleTargetAttackDagamage(
        _attacker: RpgToken,
        target: ITargetable,
    ): Maybe<number> {
        // TODO: Read lucky value from some other place
        const attackRollResults = this.attackRoll({
            isLucky: false,
        });
        printRolls("Attack rolls", attackRollResults);

        const attackRoll = attackRollResults.rolls[0];
        if (attackRoll.isCritialFailure) {
            return;
        }

        if (
            target instanceof RpgToken &&
            attackRoll.value < target.tokenData.armorClass
        ) {
            // Miss
            return;
        }

        const damageRoll = this.rollDamage({
            isCritical: attackRoll.isCriticalSuccess,
        });
        printRolls("Damage rolls", damageRoll);

        const baseDamage = damageRoll.rolls.reduce<number>((acc, roll) => {
            acc += roll.value;

            return acc;
        }, 0);

        // // TODO: apply modifier
        return baseDamage + 0;
    }
}
