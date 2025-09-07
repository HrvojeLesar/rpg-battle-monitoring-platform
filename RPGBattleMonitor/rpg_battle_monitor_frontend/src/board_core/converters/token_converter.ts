import { GBoard } from "../board";
import { TypedJson } from "../interfaces/messagable";
import { Scene } from "../scene";
import { Token, TokenAttributes } from "../token/token";
import { TokenDataBase } from "../token/token_data";

export class TokenConverter {
    public static convert(attributes: TypedJson<TokenAttributes>): Token {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (
            existingEntity instanceof Token &&
            existingEntity.shouldApplyChanges(attributes)
        ) {
            existingEntity.applyUpdateAction(attributes);

            return existingEntity;
        }

        const scene = GBoard.entityRegistry.entities.get(attributes.sceneUid);
        const tokenData = GBoard.entityRegistry.entities.get(
            attributes.tokenData,
        );

        if (scene instanceof Scene && tokenData instanceof TokenDataBase) {
            const token = new Token(scene, tokenData);
            token.applyUpdateAction(attributes);

            scene.addToken(token);

            return token;
        }

        console.warn("Token conversion failed with attributes", attributes);

        throw new Error("Token conversion failed");
    }
}
