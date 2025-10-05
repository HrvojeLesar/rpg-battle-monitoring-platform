import { ITargetable } from "@/rpg_impl/interface/targetable";
import { RpgToken } from "@/rpg_impl/tokens/rpg_token";
import { Action } from "../action";

export class Maul extends Action {
    public constructor() {
        super({
            baseDamage: "1d8",
            rangeFt: 5,
            damageType: "bludgeoning",
            targeting: ["hostile"],
        });
    }

    public damageTarget(
        attacker: RpgToken,
        target: ITargetable | ITargetable[],
    ): ITargetable[] {
        const damagedTargets: ITargetable[] = [];
        if (!Array.isArray(target)) {
            target = [target];
        }

        for (const targetable of target) {
            const damage = this.getSingleTargetAttackDagamage(
                attacker,
                targetable,
            );

            if (damage) {
                targetable.takeDamage(damage);
                damagedTargets.push(targetable);
            }
        }

        return damagedTargets;
    }
}
