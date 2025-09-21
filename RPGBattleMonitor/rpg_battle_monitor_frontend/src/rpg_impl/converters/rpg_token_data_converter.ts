import { TypedJson } from "@/board_core/interfaces/messagable";
import { RpgTokenAttributes, RpgTokenData } from "../tokens/CharacterTokenData";
import { GBoard } from "@/board_core/board";

export class RpgTokenDataConverter {
    public static convert(
        attributes: TypedJson<RpgTokenAttributes>,
    ): RpgTokenData {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (existingEntity instanceof RpgTokenData) {
            return existingEntity;
        }

        const data = new RpgTokenData();

        data.applyUpdateAction(attributes);

        return data;
    }
}
