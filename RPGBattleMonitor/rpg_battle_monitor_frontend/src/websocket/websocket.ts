import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { GBoard, GEventEmitter } from "../board_core/board";
import { IMessagable, TypedJson } from "../board_core/interfaces/messagable";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { sidebarTabAtoms } from "@/board_react_wrapper/stores/sidebar_tab_store";
import {
    TokenIcon,
    Tokens,
} from "@/board_react_wrapper/components/interface/Tokens";
import { TurnOrder } from "@/rpg_impl/components/TurnOrder";

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

    protected actionQueue: ActionMessageEmit[] = [];

    public constructor(
        uri?: string,
        opts?: Partial<ManagerOptions & SocketOptions>,
    ) {
        const socket = io(uri, opts);

        this._socket = socket;
    }

    public static createDefaultSocket(gameId: number): Websocket {
        return new Websocket(
            `ws://${import.meta.env.VITE_BASE_URL ?? "localhost:3000"}`,
            {
                path: "/api/socket.io",
                auth: {
                    userToken: "some-session-token",
                    game: gameId,
                },
            },
        );
    }

    public get socket(): Socket<ListenEvents, EmitEvents> {
        return this._socket;
    }

    public queue(data: IMessagable, queue: keyof QueueMap) {
        const action = WebsocketQueues[queue];

        const queueLenght = this.actionQueue.length;

        if (
            queueLenght === 0 ||
            this.actionQueue[queueLenght - 1].action !== action
        ) {
            this.actionQueue.push({ action, data: [data] });
        } else {
            this.actionQueue[queueLenght - 1].data.push(data);
        }
    }

    public flush() {
        // TODO: add queueing if websocket has not finished joining yet
        for (const action of this.actionQueue) {
            this.socket.emit("action", action);
        }

        this.actionQueue = [];
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

    public clear(queue: keyof QueueMap) {
        this.actionQueue = this.actionQueue.filter(
            (action) => action.action !== WebsocketQueues[queue],
        );
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
