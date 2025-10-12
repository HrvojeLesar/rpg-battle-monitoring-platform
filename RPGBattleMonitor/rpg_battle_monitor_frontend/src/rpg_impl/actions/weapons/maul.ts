import { ITargetable } from "@/rpg_impl/interface/targetable";
import { RpgToken } from "@/rpg_impl/tokens/rpg_token";
import { Action, ActionOnFinished } from "../action";
import { FederatedPointerEvent } from "pixi.js";
import { queueEntityUpdate } from "@/websocket/websocket";

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

    public doAction(
        _event: FederatedPointerEvent,
        target: RpgToken,
        initiator: RpgToken,
        onFinished?: ActionOnFinished,
    ): void {
        const damagedTargets = this.damageTarget(initiator, target);

        queueEntityUpdate(() => {
            return damagedTargets
                .filter((target) => target instanceof RpgToken)
                .map((target) => target.tokenData);
        });

        onFinished?.(initiator, target, this, {
            descriminator: "damagedTargets",
            values: damagedTargets,
        });
    }
}
