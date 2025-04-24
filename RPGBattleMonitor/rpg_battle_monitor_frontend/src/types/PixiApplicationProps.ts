import { Application, ApplicationOptions } from "pixi.js";
import { RefObject } from "react";

export interface PixiApplicationProps {
    canvas?: HTMLCanvasElement;
    resizeTo?: HTMLElement | Window | RefObject<HTMLElement | null>;
    canvasClass?: string;
    applicationOptions?: Partial<ApplicationOptions>;
    applicationIdentifier?: string;
    /** @description Called after pixi.js Application has been initialized. Can be used for seting up pixi.js state */
    applicationInitCallback?: (
        application: Application,
        applicationIdentifier?: string,
    ) => any;
}
