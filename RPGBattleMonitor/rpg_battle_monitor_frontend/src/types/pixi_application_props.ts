import { Application, ApplicationOptions } from "pixi.js";
import { RefObject } from "react";

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
        options?: Partial<ApplicationOptions>,
    ) => Promise<Application>;
};
