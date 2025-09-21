import { Scene } from "@/board_core/scene";
import { Texture } from "pixi.js";
import { RpgTokenData } from "../tokens/CharacterTokenData";
import { RpgToken } from "../tokens/CharacterToken";
import { GAssetManager } from "@/board_core/assets/asset_manager";
import { GBoard } from "@/board_core/board";
import { getUrl } from "@/board_react_wrapper/utils/utils";

const randomHexColorCode = () => {
    const n = (Math.random() * 0xfffff * 1000000).toString(16);
    return "#" + n.slice(0, 6);
};

export class RpgTokenFactory {
    public static createRandomToken(
        scene: Scene,
        tokenData?: RpgTokenData,
    ): RpgToken {
        const isImage = Math.random() < 0.5;

        const data =
            tokenData ??
            new RpgTokenData({
                image: isImage ? "/public/W_m.jpeg" : undefined,
            });

        const token = new RpgToken(
            scene,
            data,
            {
                texture: Texture.WHITE,
                tint: isImage ? undefined : randomHexColorCode(),
                width: scene.grid.cellSize * 2,
                height: scene.grid.cellSize * 2,
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

        data.tint = token.displayedEntity?.tint;

        let textureLoading: Maybe<Promise<unknown>> = undefined;
        if (isImage) {
            if (token.displayedEntity && token.tokenData.image) {
                textureLoading = GAssetManager.load({
                    sprite: token.displayedEntity,
                    url: getUrl(token.tokenData.image),
                });
            }
        }

        GBoard.entityRegistry.entities.add(token);

        if (!GBoard.entityRegistry.entities.get(token.tokenData.getUId())) {
            GBoard.entityRegistry.entities.add(token.tokenData);
            GBoard.websocket.queue(token.tokenData, "createQueue");
        }

        const flush = () => {
            GBoard.websocket.queue(token, "createQueue");
            GBoard.websocket.flush();
        };

        if (textureLoading !== undefined) {
            textureLoading.then(flush);
        } else {
            flush();
        }

        scene.addToken(token);

        return token;
    }
}
