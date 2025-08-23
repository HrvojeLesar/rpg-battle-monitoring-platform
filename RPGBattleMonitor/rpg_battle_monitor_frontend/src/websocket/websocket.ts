import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";

export class Websocket {
    protected _socket: Socket<{}, {}>;

    public constructor(
        uri?: string,
        opts?: Partial<ManagerOptions & SocketOptions>,
    ) {
        const socket = io(uri, opts) as Socket<{}>;

        this._socket = socket;
    }

    public static createDefaultSocket(): Websocket {
        return new Websocket("ws://localhost:3000", {
            path: "/api/socket.io",
            auth: {
                userToken: "some-session-token",
                game: 0,
            },
        });
    }

    public get socket(): Socket<{}, {}> {
        return this._socket;
    }
}
