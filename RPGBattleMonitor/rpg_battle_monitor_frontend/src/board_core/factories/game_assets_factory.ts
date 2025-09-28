import { GameAssets, GameAssetsAttributes } from "../assets/game_assets";
import { GBoard } from "../board";

export class GameAssetsFactory {
    public static createGameAssets(options?: GameAssetsAttributes): GameAssets {
        const gameAssets = new GameAssets(options);

        GBoard.entityRegistry.entities.add(gameAssets);

        GBoard.websocket.queue(gameAssets, "createQueue");

        GBoard.websocket.flush();

        return gameAssets;
    }
}
