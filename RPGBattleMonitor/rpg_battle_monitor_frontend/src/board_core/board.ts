import {
    Application,
    ApplicationOptions,
    DestroyOptions,
    EventEmitter,
    RendererDestroyOptions,
} from "pixi.js";
import { isDev } from "../utils/dev_mode";
import { Socket } from "socket.io-client";
import { Scene } from "./scene";

class Board {
    protected application?: Application;
    protected eventEmitter: EventEmitter;
    protected websocket?: Socket;
    protected scenes: Scene[];

    public constructor() {
        this.eventEmitter = boardEventEmitter;
        this.scenes = [];
    }

    public setApplication(application: Application) {
        this.application = application;
    }

    public getApplication(): Application {
        if (this.application === undefined) {
            throw new Error("Application is not initialized");
        }

        return this.application;
    }

    public getApplicationOptional(): Application | undefined {
        return this.application;
    }

    public setSocket(socket: Socket) {
        this.websocket = socket;
    }

    public getSocket(): Socket {
        if (this.websocket === undefined) {
            throw new Error("Websocket is not initialized");
        }

        return this.websocket;
    }
}

export async function init(
    options: Partial<ApplicationOptions>,
): Promise<Application> {
    const application = new Application();

    await application.init(options);

    if (isDev()) {
        globalThis.__PIXI_APP__ = application;
    }

    boardApplication.setApplication(application);

    return boardApplication.getApplication();
}

export function destroy(
    rendererDestroyOptions?: RendererDestroyOptions,
    options?: DestroyOptions,
) {
    boardApplication
        .getApplicationOptional()
        ?.destroy(rendererDestroyOptions, options);
}

const boardApplication: Board = new Board();
const boardEventEmitter: EventEmitter = new EventEmitter();
