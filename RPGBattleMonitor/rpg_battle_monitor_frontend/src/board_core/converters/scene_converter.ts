import { GBoard } from "../board";
import { Grid } from "../grid/grid";
import { TypedJson } from "../interfaces/messagable";
import { Scene, SceneAttributes } from "../scene";

export class SceneConverter {
    public static convert(attributes: TypedJson<SceneAttributes>): Scene {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (
            existingEntity instanceof Scene &&
            existingEntity.shouldApplyChanges(attributes)
        ) {
            existingEntity.applyUpdateAction(attributes);

            return existingEntity;
        }

        const grid = GBoard.entityRegistry.entities.get(attributes.gridUid);

        if (grid instanceof Grid) {
            const entity = new Scene({ name: attributes.name, grid: grid });
            entity.applyUpdateAction(attributes);

            GBoard.addScene(entity);

            return entity;
        }

        console.warn("Scene conversion failed with attributes", attributes);

        throw new Error("Scene conversion failed");
    }
}
