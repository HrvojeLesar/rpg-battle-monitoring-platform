import { RpgToken } from "@/rpg_impl/tokens/rpg_token";
import {
    Action,
    ActionCallbacks,
    ApplyDamageResult,
    DamageResult,
} from "../action";
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
        target: RpgToken | RpgToken[],
        callbacks?: ActionCallbacks,
    ): RpgToken[] | ApplyDamageResult {
        const damagedTargets: RpgToken[] = [];
        if (!Array.isArray(target)) {
            target = [target];
        }

        const damageResults: DamageResult[] = [];

        for (const targetable of target) {
            damageResults.push({
                target: targetable,
                damage: this.getSingleTargetAttackDamage(
                    attacker,
                    targetable,
                    callbacks,
                ),
            });
        }

        callbacks?.onTargetDamageCallback?.(attacker, damageResults);

        const applyDamage = (): RpgToken[] => {
            if (damagedTargets.length > 0) {
                return damagedTargets;
            }

            for (const entry of damageResults) {
                const { target: targetable, damage: damageResult } = entry;
                if (damageResult.damage) {
                    targetable.takeDamage(
                        damageResult.damage,
                        damageResult.isCritical ?? false,
                    );
                    if (targetable instanceof RpgToken) {
                        damagedTargets.push(targetable);
                    }
                }
            }

            return damagedTargets;
        };

        if (callbacks?.actCallback !== undefined) {
            return {
                damageResults,
                applyDamage,
            };
        } else {
            return applyDamage();
        }
    }

    public doAction(
        target: RpgToken,
        initiator: RpgToken,
        _event?: FederatedPointerEvent,
        callbacks?: ActionCallbacks,
    ): void {
        const damageTargetResult = this.damageTarget(
            initiator,
            target,
            callbacks,
        );

        let damagedTargets: RpgToken[] = [];
        if (Array.isArray(damageTargetResult)) {
            damagedTargets = damageTargetResult;
        }

        const act = () => {
            if (!Array.isArray(damageTargetResult)) {
                damagedTargets = damageTargetResult
                    .applyDamage()
                    .filter((target) => target instanceof RpgToken);
            }

            queueEntityUpdate(() => {
                return damagedTargets
                    .filter((target) => target instanceof RpgToken)
                    .map((target) => target.tokenData);
            });

            callbacks?.onFinished?.(initiator, target, this, {
                descriminator: "damagedTargets",
                values: damagedTargets,
            });
        };

        if (
            callbacks?.actCallback !== undefined &&
            !Array.isArray(damageTargetResult)
        ) {
            callbacks.actCallback(damageTargetResult.damageResults, act);
        } else {
            act();
        }
    }
}
