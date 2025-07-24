import { io, Socket } from "socket.io-client";

export function createSocket(): Socket {
    const socket = io("ws://localhost:3000", {
        path: "/api/socket.io",
    });

    return socket;
}
