import { TypedJson } from "@/board_core/interfaces/messagable";
import { SceneAttributes } from "@/board_core/scene";
import { RpgScene } from "../scene/scene";
import { GBoard } from "@/board_core/board";
import { Grid } from "@/board_core/grid/grid";

export class RpgSceneConverter {
    public static convert(attributes: TypedJson<SceneAttributes>): RpgScene {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (
            existingEntity instanceof RpgScene &&
            existingEntity.shouldApplyChanges(attributes)
        ) {
            existingEntity.applyUpdateAction(attributes);

            return existingEntity;
        }

        const grid = GBoard.entityRegistry.entities.get(attributes.gridUid);

        if (grid instanceof Grid) {
            const entity = new RpgScene({ name: attributes.name, grid: grid });
            entity.applyUpdateAction(attributes);

            GBoard.addScene(entity);

            return entity;
        }

        console.warn("Rpg scene conversion failed with attributes", attributes);

        throw new Error("Rpg scene conversion failed");
    }
}
