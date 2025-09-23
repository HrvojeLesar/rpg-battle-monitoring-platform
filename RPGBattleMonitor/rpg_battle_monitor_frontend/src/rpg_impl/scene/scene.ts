import { Scene, SceneOptions } from "@/board_core/scene";
import { TurnOrder } from "../turn/turn_order";
import { GBoard } from "@/board_core/board";

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
            GBoard.entityRegistry.entities.remove(this._turnOrder);
        }

        this._turnOrder = turnOrder;
    }
}
