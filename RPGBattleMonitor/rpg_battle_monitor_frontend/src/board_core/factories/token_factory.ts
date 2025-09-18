import { Texture } from "pixi.js";
import { Scene } from "../scene";
import { EmptyTokenData } from "../token/empty_token_data";
import { Token } from "../token/token";
import { GBoard } from "../board";
import { TokenDataBase } from "../token/token_data";
import { GAssetManager } from "../assets/asset_manager";

const randomHexColorCode = () => {
    const n = (Math.random() * 0xfffff * 1000000).toString(16);
    return "#" + n.slice(0, 6);
};

export class TokenFactory {
    public static createToken(scene: Scene, tokenData?: TokenDataBase): Token {
        const token = new Token(
            scene,
            tokenData ?? new EmptyTokenData(),
            {
                texture: Texture.WHITE,
                tint: randomHexColorCode(),
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

        let textureLoading: Maybe<Promise<unknown>> = undefined;
        if (token.displayedEntity) {
            textureLoading = GAssetManager.load({
                sprite: token.displayedEntity,
                url: "http://localhost:3000/api/assets/9e7208f56a5c47379df0cfcbe4801b55.jpg",
            });
        }

        GBoard.entityRegistry.entities.add(token);

        if (!GBoard.entityRegistry.entities.get(token.tokenData.getUId())) {
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
