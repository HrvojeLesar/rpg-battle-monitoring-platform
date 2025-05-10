import type EventEmitter from "eventemitter3";

type EventNames = {
    testEvent: (t: string) => void;
};

type EventEmmiterTypes = {
    [K in keyof EventNames]: [event: EventNames[K]];
};

export type ReactPixiJsBridgeEventEmitter = EventEmitter<EventEmmiterTypes>;
