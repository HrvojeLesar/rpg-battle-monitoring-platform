import { FederatedPointerEvent } from "pixi.js";
import { ITargetable } from "../interface/targetable";
import { RpgToken } from "../tokens/rpg_token";
import {
    Action,
    ActionCallbacks,
    ApplyDamageResult,
    DamageResult,
} from "./action";
import { TurnOrderEntry } from "../turn/turn_order";

export class Dash extends Action<DamageResult[], TurnOrderEntry> {
    public constructor() {
        super({
            baseDamage: "1d20",
            rangeFt: 0,
            damageType: "",
            targeting: [],
        });
    }

    public damageTarget(): ITargetable[] | ApplyDamageResult {
        return [];
    }

    public doAction(
        _target: RpgToken,
        _initiator: RpgToken,
        _event?: FederatedPointerEvent,
        callbacks?: ActionCallbacks<DamageResult[]> | undefined,
        otherData?: TurnOrderEntry,
    ): void {
        if (otherData?.speed) {
            otherData.speed += otherData.baseSpeed;
        }

        callbacks?.onFinished?.(_initiator, _target, this);
    }
}
