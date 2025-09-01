import { Application, ApplicationOptions } from "pixi.js";
import { RefObject } from "react";
import { BoardInitOptions } from "../board_core/board";
import { Websocket } from "../websocket/websocket";

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
        boardInitOptions: BoardInitOptions,
        options?: Partial<ApplicationOptions>,
        socket?: Websocket,
    ) => Promise<Application>;
};
