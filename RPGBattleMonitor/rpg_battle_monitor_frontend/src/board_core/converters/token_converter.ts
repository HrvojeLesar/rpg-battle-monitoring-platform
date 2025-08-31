import { GBoard } from "../board";
import { Grid } from "../grid/grid";
import { TypedJson } from "../interfaces/messagable";
import { Scene } from "../scene";
import { Token, TokenAttributes } from "../token/token";
import { TokenDataBase } from "../token/token_data";

export class TokenConverter {
    public static convert(attributes: TypedJson<TokenAttributes>): Token {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (existingEntity instanceof Token) {
            existingEntity.applyUpdateAction(attributes);

            return existingEntity;
        }

        const grid = GBoard.entityRegistry.entities.get(attributes.gridUid);
        const scene = GBoard.entityRegistry.entities.get(attributes.sceneUid);
        const tokenData = GBoard.entityRegistry.entities.get(
            attributes.tokenData,
        );

        if (
            grid instanceof Grid &&
            scene instanceof Scene &&
            tokenData instanceof TokenDataBase
        ) {
            const token = new Token(grid, scene, tokenData);
            token.applyUpdateAction(attributes);

            return token;
        }

        console.warn("Token conversion failed with attributes", attributes);

        throw new Error("Token conversion failed");
    }
}
