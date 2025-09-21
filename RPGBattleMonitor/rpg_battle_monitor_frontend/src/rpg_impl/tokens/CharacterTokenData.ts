import { TokenDataBase } from "@/board_core/token/token_data";

export type CharacterTokenAttributes = {};

export class CharacterTokenData extends TokenDataBase<CharacterTokenAttributes> {
    public getAttributes(): CharacterTokenAttributes {
        return {};
    }
}
