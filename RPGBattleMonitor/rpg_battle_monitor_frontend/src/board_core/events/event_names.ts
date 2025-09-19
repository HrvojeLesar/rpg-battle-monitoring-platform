import { JoinData } from "../../websocket/websocket";

export type EventNames = {
    "board-init-started": () => void;
    "board-init-finished": () => void;
    "board-destoryed": () => void;

    "socket-join-started": () => void;
    "socket-join-finished": () => void;
    "socket-join": (joinData: JoinData) => void;

    "keyup": (event: KeyboardEvent) => void;
};

export type EventEmitterTypes = {
    [K in keyof EventNames]: Parameters<EventNames[K]>;
};
