import { FederatedPointerEvent } from "pixi.js";
import { ITargetable } from "../interface/targetable";
import { RpgToken } from "../tokens/rpg_token";
import { Action, ActionCallbacks } from "./action";
import { printRolls } from "../rolls/dice";
import {
    calculateNextHealthState,
    HealthState,
} from "../characters_stats/health_state";

export class DeathSave extends Action {
    public constructor() {
        super({
            baseDamage: "1d20",
            rangeFt: 0,
            damageType: "",
            targeting: [],
        });
    }

    public damageTarget(): ITargetable[] {
        return [];
    }

    public doAction(
        target: RpgToken,
        initiator: RpgToken,
        _event?: FederatedPointerEvent,
        callbacks?: ActionCallbacks,
    ): void {
        const result = this.rollDamage();
        printRolls("Death save", result);

        const deathSave = result.rolls[0];

        if (deathSave.value >= 10) {
            if (deathSave.isCriticalSuccess) {
                initiator.tokenData.hitPoints.current = 1;
                initiator.tokenData.healthState = HealthState.Healthy;
            }
            initiator.tokenData.deathSaves.successes += 1;
        } else {
            if (deathSave.isCritialFailure) {
                initiator.tokenData.deathSaves.failures += 1;
            }
            initiator.tokenData.deathSaves.failures += 1;
        }

        const nextHealthState = calculateNextHealthState(
            initiator.tokenData,
            {},
        );

        if (nextHealthState !== initiator.tokenData.healthState) {
            initiator.tokenData.healthState = nextHealthState;
        }

        callbacks?.onFinished?.(initiator, target, this, {
            descriminator: "deathSave",
            values: undefined,
        });
    }
}
