import { TokenDataBase } from "./token_data";

export class EmptyTokenData extends TokenDataBase {
    public getAttributes() {
        return {};
    }
}
