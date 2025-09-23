import { GBoard } from "@/board_core/board";
import { RpgScene } from "../scene/scene";
import { TurnOrder } from "../turn/turn_order";

export class TurnOrderFactory {
    public static create(scene: RpgScene): TurnOrder {
        const turnOrder = new TurnOrder(scene);

        GBoard.entityRegistry.entities.add(turnOrder);
        GBoard.websocket.queue(turnOrder, "createQueue");
        GBoard.websocket.flush();

        scene.turnOrder = turnOrder;

        return turnOrder;
    }
}
