import { GBoard } from "../board";
import {
    SpriteExtension,
    SpriteExtensionAttributes,
} from "../extensions/sprite_extension";
import { Grid } from "../grid/grid";
import { TypedJson } from "../interfaces/messagable";

export class SpriteExtensionConverter {
    public static convert(
        attributes: TypedJson<SpriteExtensionAttributes>,
    ): SpriteExtension {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (existingEntity instanceof SpriteExtension) {
            existingEntity.applyChanges(attributes);

            return existingEntity;
        }

        const grid = GBoard.entityRegistry.entities.get(attributes.gridUid);

        if (grid instanceof Grid) {
            const entity = new SpriteExtension(grid, attributes, attributes);

            return entity;
        }

        console.error(
            "SpriteExtension conversion failed with attributes",
            attributes,
        );

        throw new Error("SpriteExtension conversion failed");
    }
}
