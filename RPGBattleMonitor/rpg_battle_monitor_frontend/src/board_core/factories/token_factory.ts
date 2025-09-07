import { Texture } from "pixi.js";
import { Scene } from "../scene";
import { EmptyTokenData } from "../token/empty_token_data";
import { Token } from "../token/token";
import { GBoard } from "../board";
import { TokenDataBase } from "../token/token_data";

export class TokenFactory {
    public static createToken(scene: Scene, tokenData?: TokenDataBase): Token {
        const token = new Token(
            scene,
            tokenData ?? new EmptyTokenData(),
            {
                texture: Texture.WHITE,
                tint: "blue",
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

        GBoard.entityRegistry.entities.add(token);

        if (!GBoard.entityRegistry.entities.get(token.tokenData.getUId())) {
            GBoard.websocket.queue(token.tokenData, "createQueue");
        }
        GBoard.websocket.queue(token, "createQueue");

        GBoard.websocket.flush();

        scene.addToken(token);

        return token;
    }
}
