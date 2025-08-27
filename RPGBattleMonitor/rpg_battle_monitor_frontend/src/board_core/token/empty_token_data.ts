import { GBoard } from "../board";
import { TokenDataBase } from "./token_data";

export class EmptyTokenData extends TokenDataBase<{}> {
    public getAttributes() {
        return {};
    }

    public applyUpdateAction(_changes: unknown): void {}

    public deleteAction(): void {
        GBoard.websocket.socket.emit("delete", this);
    }
}
