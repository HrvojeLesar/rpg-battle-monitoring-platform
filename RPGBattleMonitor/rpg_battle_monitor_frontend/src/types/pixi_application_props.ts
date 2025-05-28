import { Application, ApplicationOptions } from "pixi.js";
import { RefObject } from "react";
import { ReactPixiJsBridgeEventEmitter } from "./event_emitter";

export interface PixiApplicationProps {
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
    ) => any;
}
