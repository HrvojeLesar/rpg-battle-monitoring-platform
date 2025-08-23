import { GBoard } from "../board";
import { TypedJson } from "../interfaces/messagable";
import { EmptyTokenData } from "../token/empty_token_data";

export class EmptyTokenDataConverter {
    public static convert(attributes: TypedJson<{}>): EmptyTokenData {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (existingEntity instanceof EmptyTokenData) {
            return existingEntity;
        }

        return new EmptyTokenData();
    }
}
