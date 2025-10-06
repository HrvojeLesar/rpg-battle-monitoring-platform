import { JoinData } from "../../websocket/websocket";
import {
    DefaultAttributes,
    IMessagable,
    TypedJson,
} from "../interfaces/messagable";

export type EventNames = {
    "board-init-started": () => void;
    "board-init-finished": () => void;
    "board-destroyed": () => void;

    "socket-join-started": () => void;
    "socket-join-finished": () => void;
    "socket-join": (joinData: JoinData) => void;

    keyup: (event: KeyboardEvent) => void;

    "entity-added": (entity: IMessagable) => void;
    "entity-removed": (entity: IMessagable | IMessagable[]) => void;
    "entity-updated": <T extends DefaultAttributes>(
        entity: IMessagable,
        oldData?: T,
        newData?: TypedJson<T>,
    ) => void;
};

export type EventEmitterTypes = {
    [K in keyof EventNames]: Parameters<EventNames[K]>;
};
