import { GBoard } from "@/board_core/board";
import { RpgTokenData } from "../tokens/rpg_token_data";

export class TokenDataFactory {
    public static create(): RpgTokenData {
        const tokenData = new RpgTokenData();

        GBoard.entityRegistry.entities.add(tokenData);
        GBoard.websocket.queue(tokenData, "createQueue");
        GBoard.websocket.flush();

        return tokenData;
    }
}
