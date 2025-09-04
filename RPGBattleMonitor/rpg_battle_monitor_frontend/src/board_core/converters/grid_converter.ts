import { GBoard } from "../board";
import { Grid, GridAttributes } from "../grid/grid";
import { TypedJson } from "../interfaces/messagable";

export class GridConverter {
    public static convert(attributes: TypedJson<GridAttributes>): Grid {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (existingEntity instanceof Grid) {
            existingEntity.applyUpdateAction(attributes);

            return existingEntity;
        }

        const grid = new Grid(attributes);
        grid.applyUpdateAction(attributes);

        return grid;
    }
}
