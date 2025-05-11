import type EventEmitter from "eventemitter3";
import { Viewport } from "pixi-viewport";

type EventNames = {
    viewportMoved: {
        viewport: Viewport;
        type: "move" | "zoom";
    };
};

type EventEmmiterTypes = {
    [K in keyof EventNames]: [event: EventNames[K]];
};

export type ReactPixiJsBridgeEventEmitter = EventEmitter<EventEmmiterTypes>;
