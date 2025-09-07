import { DeleteAction } from "../interfaces/messagable";
import { TokenDataBase } from "./token_data";

export class EmptyTokenData extends TokenDataBase {
    public getAttributes() {
        return {};
    }

    public deleteAction(action: DeleteAction): void {
        // TODO: delete tokens on board
        action.acc.push(this);
    }
}
