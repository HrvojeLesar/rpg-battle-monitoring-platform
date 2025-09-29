import { TypedJson } from "@/board_core/interfaces/messagable";
import { TokenAttributes } from "@/board_core/token/token";
import { GBoard } from "@/board_core/board";
import { Scene } from "@/board_core/scene";
import { DecorationToken } from "../tokens/decoration_token";
import { DecorationTokenData } from "../tokens/decoration_token_data";

export class DecorationTokenConverter {
    public static convert(
        attributes: TypedJson<TokenAttributes>,
    ): DecorationToken {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (
            existingEntity instanceof DecorationToken &&
            existingEntity.shouldApplyChanges(attributes)
        ) {
            existingEntity.applyUpdateAction(attributes);

            return existingEntity;
        }

        const scene = GBoard.entityRegistry.entities.get(attributes.sceneUid);
        const tokenData = GBoard.entityRegistry.entities.get(
            attributes.tokenData,
        );

        if (
            scene instanceof Scene &&
            tokenData instanceof DecorationTokenData
        ) {
            const token = new DecorationToken(scene, tokenData);
            token.applyUpdateAction(attributes);

            scene.addToken(token, token.layer);

            return token;
        }

        console.warn("Token conversion failed with attributes", attributes);

        throw new Error("DecorationToken conversion failed");
    }
}
