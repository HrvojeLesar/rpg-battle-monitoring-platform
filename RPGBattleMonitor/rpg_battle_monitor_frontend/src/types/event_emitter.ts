import type EventEmitter from "eventemitter3";
import { Viewport } from "pixi-viewport";
import { ApplicationManager } from "../canvas/managers/application_manager";

export type InitApplicationEvent = {
    instanceNumber: number;
    app: ApplicationManager;
};

export type DestoryApplicationEvent = {
    app?: ApplicationManager;
    instanceNumber: number;
};

type EventNames = {
    initApplication: InitApplicationEvent;
    destroyApplication: DestoryApplicationEvent;
    viewportMoved: {
        viewport: Viewport;
        type: "move" | "zoom";
    };
};

export type EventEmmiterTypes = {
    [K in keyof EventNames]: [event: EventNames[K]];
};

export type ReactPixiJsBridgeEventEmitter = EventEmitter<EventEmmiterTypes>;
export type GridEventEmitter = EventEmitter<EventEmmiterTypes>;
