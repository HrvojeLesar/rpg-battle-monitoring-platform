import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";

export class SocketioWebsocket extends Socket {
    public static createSocket(
        uri?: string,
        opts?: Partial<ManagerOptions & SocketOptions>,
    ): Socket {
        const socket = io(uri, opts);

        return socket;
    }

    public static createDefaultSocket(): Socket {
        return SocketioWebsocket.createSocket("ws://localhost:3000", {
            path: "/api/socket.io",
        });
    }
}
