import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { GBoard } from "../board_core/board";
import { IMessagable, TypedJson } from "../board_core/interfaces/messagable";

export type JoinData = {
    data: TypedJson[];
    progress: {
        sent: number;
        total: number;
    };
};

export type ListenEvents = {
    "join-finished": () => void;
    join: (joinData: JoinData) => void;
    update: (data: TypedJson[]) => void;
};

export type EmitEvents = {
    join: () => void;
    create: (data: IMessagable) => void;
    update: (data: IMessagable[]) => void;
    delete: (data: IMessagable) => void;
};

export class Websocket {
    protected _socket: Socket<ListenEvents, EmitEvents>;
    public joined: boolean = false;
    protected updateQueue: IMessagable[] = [];

    public constructor(
        uri?: string,
        opts?: Partial<ManagerOptions & SocketOptions>,
    ) {
        const socket = io(uri, opts);

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

    public get socket(): Socket<ListenEvents, EmitEvents> {
        return this._socket;
    }

    public queueUpdate(data: IMessagable) {
        this.updateQueue.push(data);
    }

    public flush() {
        if (this.updateQueue.length > 0) {
            this.socket.emit("update", this.updateQueue);
            this.updateQueue = [];
        }
    }

    public initJoin() {
        const join = (joinData: JoinData) => {
            for (const entityData of joinData.data) {
                const entity =
                    GBoard.entityRegistry.registeredEntityKinds.tryConvert(
                        entityData,
                    );
                if (entity !== undefined) {
                    GBoard.entityRegistry.entities.add(entity);
                }
            }
        };

        const joinFinished = () => {
            this.joined = true;
            this.socket.off("join", join);

            console.log(GBoard.entityRegistry.sortedEntities);
        };

        this.socket.once("join-finished", joinFinished);

        this.socket.on("join", join);

        this.socket.emit("join");
    }
}
