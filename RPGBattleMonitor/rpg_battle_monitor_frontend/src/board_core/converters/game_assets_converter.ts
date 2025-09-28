import { GameAssets, GameAssetsAttributes } from "../assets/game_assets";
import { GBoard } from "../board";
import { TypedJson } from "../interfaces/messagable";

export class GameAssetsConverter {
    public static convert(
        attributes: TypedJson<GameAssetsAttributes>,
    ): GameAssets {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (
            existingEntity instanceof GameAssets &&
            existingEntity.shouldApplyChanges(attributes)
        ) {
            existingEntity.applyUpdateAction(attributes);

            return existingEntity;
        }

        const gameAssets = new GameAssets(attributes);
        gameAssets.applyUpdateAction(attributes);

        return gameAssets;
    }
}
