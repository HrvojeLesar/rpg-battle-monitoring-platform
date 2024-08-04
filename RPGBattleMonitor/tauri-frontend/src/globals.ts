import { Socket, io } from "socket.io-client";

export const SOCKET = io("ws://localhost:3000/ws", {
    auth: { room: "token" },
});

export function createSocket(room: string): Socket {
    const socket = io("ws://localhost:3000/testroom", {
        auth: { room },
    });

    return socket;
}
