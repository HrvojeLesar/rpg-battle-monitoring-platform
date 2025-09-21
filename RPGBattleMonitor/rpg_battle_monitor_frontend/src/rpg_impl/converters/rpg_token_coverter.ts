import { TypedJson } from "@/board_core/interfaces/messagable";
import { TokenAttributes } from "@/board_core/token/token";
import { RpgToken } from "../tokens/CharacterToken";
import { GBoard } from "@/board_core/board";
import { Scene } from "@/board_core/scene";
import { RpgTokenData } from "../tokens/CharacterTokenData";

export class RpgTokenConverter {
    public static convert(attributes: TypedJson<TokenAttributes>): RpgToken {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (
            existingEntity instanceof RpgToken &&
            existingEntity.shouldApplyChanges(attributes)
        ) {
            existingEntity.applyUpdateAction(attributes);

            return existingEntity;
        }

        const scene = GBoard.entityRegistry.entities.get(attributes.sceneUid);
        const tokenData = GBoard.entityRegistry.entities.get(
            attributes.tokenData,
        );

        if (scene instanceof Scene && tokenData instanceof RpgTokenData) {
            const token = new RpgToken(scene, tokenData);
            token.applyUpdateAction(attributes);

            scene.addToken(token);

            return token;
        }

        console.warn("Token conversion failed with attributes", attributes);

        throw new Error("RpgToken conversion failed");
    }
}
