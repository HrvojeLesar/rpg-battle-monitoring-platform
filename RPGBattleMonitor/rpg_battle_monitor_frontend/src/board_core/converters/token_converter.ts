import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";
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

        const scene = GBoard.entityRegistry.entities.get(attributes.sceneUid);
        const tokenData = GBoard.entityRegistry.entities.get(
            attributes.tokenData,
        );
        const container = GBoard.entityRegistry.entities.get(
            attributes.containerUid,
        );

        if (
            container instanceof ContainerExtension &&
            scene instanceof Scene &&
            tokenData instanceof TokenDataBase
        ) {
            const token = new Token(container, scene, tokenData);

            return token;
        }

        console.warn("Token conversion failed with attributes", attributes);

        throw new Error("Token conversion failed");
    }
}
