import { Application, ApplicationOptions } from "pixi.js";
import { RefObject } from "react";
import { ReactPixiJsBridgeEventEmitter } from "./event_emitter";
import { ApplicationManager } from "../canvas/managers/application_manager";
import { Socket } from "socket.io-client";

export type PixiApplicationProps = {
    canvas?: HTMLCanvasElement;
    resizeTo?:
        | HTMLElement
        | Window
        | RefObject<HTMLElement | undefined>
        | undefined;
    canvasClass?: string;
    applicationOptions?: Partial<ApplicationOptions>;
    applicationIdentifier?: string;
    /** @description Called after pixi.js Application has been initialized. Can be used for seting up pixi.js state */
    applicationInitCallback?: (
        application: Application,
        eventEmitter: ReactPixiJsBridgeEventEmitter,
        socket: Socket,
    ) => ApplicationManager;
};
