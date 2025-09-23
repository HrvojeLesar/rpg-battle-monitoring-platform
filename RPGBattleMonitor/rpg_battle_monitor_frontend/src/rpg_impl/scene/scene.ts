import { Scene, SceneOptions } from "@/board_core/scene";
import { TurnOrder } from "../turn/turn_order";
import { removeAndFlushEntities } from "@/board_core/utils/remove_and_flush_entities";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { turnOrderAtoms } from "../stores/turn_order_store";

export type RpgSceneOptions = { turnOrder?: TurnOrder } & SceneOptions;

export class RpgScene extends Scene {
    protected _turnOrder: Maybe<TurnOrder>;

    public constructor(options: RpgSceneOptions) {
        super(options);

        this._turnOrder = options.turnOrder;
    }

    public get turnOrder(): Maybe<TurnOrder> {
        return this._turnOrder;
    }

    public set turnOrder(turnOrder: Maybe<TurnOrder>) {
        if (
            this._turnOrder &&
            this._turnOrder.getUId() !== turnOrder?.getUId()
        ) {
            removeAndFlushEntities(this._turnOrder);
        }

        this._turnOrder = turnOrder;

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }
}
