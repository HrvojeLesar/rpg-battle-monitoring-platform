import { TokenDataBase } from "./token_data";

export class EmptyTokenData extends TokenDataBase<{}> {
    getAttributes() {
        return {};
    }

    applyChanges(_changes: unknown): void {}
}
