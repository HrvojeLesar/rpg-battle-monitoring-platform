import { Scene } from "@/board_core/scene";
import { Point, Texture } from "pixi.js";
import { GAssetManager } from "@/board_core/assets/asset_manager";
import { GBoard } from "@/board_core/board";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { GridCell } from "@/board_core/grid/cell";
import { DecorationToken } from "../tokens/decoration_token";
import { DecorationTokenData } from "../tokens/decoration_token_data";
import { Asset } from "@/board_core/assets/game_assets";

export class DecorationTokenFactory {
    public static create(
        scene: Scene,
        asset: Asset,
        position?: Point,
    ): DecorationToken {
        const tokenDataObjects = GBoard.entityRegistry.entities.list(
            (entity) => entity instanceof DecorationTokenData,
        ) as DecorationTokenData[];

        const existingTokenData = tokenDataObjects.find(
            (entity) =>
                entity.asset !== undefined && entity.asset.url === asset.url,
        );

        const tokenData = existingTokenData
            ? existingTokenData
            : new DecorationTokenData({ asset, image: asset.url });

        const token = new DecorationToken(
            scene,
            tokenData,
            {
                texture: Texture.WHITE,
                width: scene.grid.cellSize,
                height: scene.grid.cellSize,
            },
            {
                isSnapping: true,
                isDraggable: true,
                isSelectable: true,
                isResizable: true,
                eventMode: "static",
                cursor: "pointer",
                position: { x: scene.grid.x, y: scene.grid.y },
            },
        );

        if (position !== undefined) {
            const cell = GridCell.getGridCellFromPoint(position, scene.grid);

            // TODO: Fix off by one error
            token.moveToGridCell(cell);
        }

        if (token.displayedEntity && token.tokenData.image) {
            GAssetManager.load({
                sprite: token.displayedEntity,
                url: getUrl(token.tokenData.image),
            });
        }

        GBoard.entityRegistry.entities.add(token);

        if (!GBoard.entityRegistry.entities.get(token.tokenData.getUId())) {
            GBoard.entityRegistry.entities.add(token.tokenData);
            GBoard.websocket.queue(token.tokenData, "createQueue");
        }

        GBoard.websocket.queue(token, "createQueue");
        GBoard.websocket.flush();

        scene.addToken(token, token.layer);

        return token;
    }
}
