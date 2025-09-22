import { GBoard } from "../board";
import { TypedJson } from "../interfaces/messagable";
import { EmptyTokenData } from "../token/empty_token_data";
import { TokenDataBaseAttributes } from "../token/token_data";

export class EmptyTokenDataConverter {
    public static convert(
        attributes: TypedJson<TokenDataBaseAttributes>,
    ): EmptyTokenData {
        const existingEntity = GBoard.entityRegistry.entities.get(
            attributes.uid,
        );

        if (existingEntity instanceof EmptyTokenData) {
            return existingEntity;
        }

        const data = new EmptyTokenData();

        data.applyUpdateAction(attributes);

        return data;
    }
}
