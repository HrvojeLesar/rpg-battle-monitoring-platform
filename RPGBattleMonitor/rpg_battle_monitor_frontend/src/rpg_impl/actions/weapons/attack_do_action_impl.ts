import { RpgToken } from "@/rpg_impl/tokens/rpg_token";
import { Action, ActionCallbacks, ApplyDamageResult } from "../action";
import { FederatedPointerEvent } from "pixi.js";
import { queueEntityUpdate } from "@/websocket/websocket";

export function doAction(
    action: Action,
    target: RpgToken,
    initiator: RpgToken,
    _event?: FederatedPointerEvent,
    callbacks?: ActionCallbacks,
): void {
    const damageTargetResult = action.damageTarget(
        initiator,
        target,
        callbacks,
    ) as RpgToken[] | ApplyDamageResult;

    let damagedTargets: RpgToken[] = [];
    if (Array.isArray(damageTargetResult)) {
        damagedTargets = damageTargetResult;
    }

    let acted = false;
    const act = () => {
        if (acted) {
            return;
        }

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

        callbacks?.onFinished?.(initiator, target, action, {
            descriminator: "damagedTargets",
            values: damagedTargets,
        });

        acted = true;
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
