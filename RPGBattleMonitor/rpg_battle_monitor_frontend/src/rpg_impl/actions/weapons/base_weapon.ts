import { RpgToken } from "@/rpg_impl/tokens/rpg_token";
import {
    Action,
    ActionCallbacks,
    ApplyDamageResult,
    DamageResult,
} from "../action";
import { FederatedPointerEvent } from "pixi.js";
import { doAction } from "./attack_do_action_impl";

export abstract class BaseWeapon extends Action {
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
        event?: FederatedPointerEvent,
        callbacks?: ActionCallbacks,
    ): void {
        doAction(this, target, initiator, event, callbacks);
    }
}
