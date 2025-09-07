import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { GBoard, GEventEmitter } from "../board_core/board";
import { IMessagable, TypedJson } from "../board_core/interfaces/messagable";

export type JoinData = {
    data: TypedJson[];
    progress: {
        sent: number;
        total: number;
    };
};

export enum WebsocketQueues {
    updateQueue = "update",
    createQueue = "create",
    deleteQueue = "delete",
}

type QueueMap = Record<keyof typeof WebsocketQueues, IMessagable[]>;

export type ListenEvents = {
    "join-finished": () => void;
    join: (joinData: JoinData) => void;
    action: (data: ActionMessageListen) => void;
};

export type EmitEvents = {
    join: () => void;
    action: (data: ActionMessageEmit) => void;
};

export type ActionMessageEmit = {
    action: WebsocketQueues;
    data: IMessagable[];
};

export type ActionMessageListen = {
    action: WebsocketQueues;
    data: TypedJson[];
};

export class Websocket {
    protected _socket: Socket<ListenEvents, EmitEvents>;
    public joined: boolean = false;
    protected queues: QueueMap;

    public constructor(
        uri?: string,
        opts?: Partial<ManagerOptions & SocketOptions>,
    ) {
        const socket = io(uri, opts);

        this._socket = socket;

        this.queues = {} as QueueMap;
        for (const key of Object.keys(WebsocketQueues)) {
            this.queues[key as keyof QueueMap] = [];
        }
    }

    public static createDefaultSocket(gameId: number): Websocket {
        return new Websocket("ws://localhost:3000", {
            path: "/api/socket.io",
            auth: {
                userToken: "some-session-token",
                game: gameId,
            },
        });
    }

    public get socket(): Socket<ListenEvents, EmitEvents> {
        return this._socket;
    }

    public queue(data: IMessagable, queue: keyof QueueMap) {
        this.queues[queue].push(data);
    }

    public flush() {
        // TODO: add queueing if websocket has not finished joining yet
        for (const [key, value] of Object.entries(WebsocketQueues)) {
            const queue = this.queues[key as keyof QueueMap];
            if (queue.length > 0) {
                this.socket.emit("action", { action: value, data: queue });
                this.queues[key as keyof QueueMap] = [];
            }
        }
    }

    public initJoin() {
        GEventEmitter.emit("socket-join-started");
        const join = (joinData: JoinData) => {
            GEventEmitter.emit("socket-join", joinData);
            GBoard.entityRegistry.queue(joinData.data);
        };

        const joinFinished = () => {
            this.joined = true;
            this.socket.off("join", join);
            GBoard.entityRegistry.convertQueuedEntities();
            GEventEmitter.emit("socket-join-finished");
        };

        this.socket.once("join-finished", joinFinished);

        this.socket.on("join", join);

        this.socket.emit("join");
    }
}

export const queueEntityUpdate = (
    updateFn: () => IMessagable[] | IMessagable,
) => {
    let entities = updateFn();
    if (!Array.isArray(entities)) {
        entities = [entities];
    }

    for (const entity of entities) {
        GBoard.websocket.queue(entity, "updateQueue");
    }

    GBoard.websocket.flush();
};
