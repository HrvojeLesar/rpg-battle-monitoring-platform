import { TypedJson } from "@/board_core/interfaces/messagable";
import { RpgScene } from "../scene/scene";
import { GBoard } from "@/board_core/board";
import { TurnOrder, TurnOrderAttributes } from "../turn/turn_order";

export class TurnOrderConverter {
    public static convert(
        attributes: TypedJson<TurnOrderAttributes>,
    ): TurnOrder {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (
            existingEntity instanceof TurnOrder &&
            existingEntity.shouldApplyChanges(attributes)
        ) {
            existingEntity.applyUpdateAction(attributes);

            return existingEntity;
        }

        const scene = GBoard.entityRegistry.entities.get(attributes.sceneUid);

        if (scene instanceof RpgScene) {
            const entity = new TurnOrder(scene, attributes);
            entity.applyUpdateAction(attributes);

            scene.turnOrder = entity;

            return entity;
        }

        console.warn(
            "Turn order conversion failed with attributes",
            attributes,
        );

        throw new Error("Turn order conversion failed");
    }
}
