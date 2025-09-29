import { GBoard } from "@/board_core/board";
import {
    DecorationTokenData,
    DecorationTokenDataAttributes,
} from "../tokens/decoration_token_data";
import { TypedJson } from "@/board_core/interfaces/messagable";

export class DecorationTokenDataConverter {
    public static convert(
        attributes: TypedJson<DecorationTokenDataAttributes>,
    ): DecorationTokenData {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (existingEntity instanceof DecorationTokenData) {
            return existingEntity;
        }

        const data = new DecorationTokenData();

        data.applyUpdateAction(attributes);

        return data;
    }
}
