import {
    Application,
    ApplicationOptions,
    Container,
    DestroyOptions,
    RendererDestroyOptions,
} from "pixi.js";
import { isDev } from "../utils/dev_mode";
import { Socket } from "socket.io-client";
import { Scene } from "./scene";
import { Viewport } from "pixi-viewport";
import "./mixins/point_mixin";
import { BoardEventEmitter } from "./events/board_event_emitters";
import { Grid } from "./grid/grid";
import { SocketioWebsocket } from "../websocket/websocket";

export type GameBoard = Board;

class Board {
    public scenes: Scene[];

    protected application?: Application;
    protected currentScene?: Scene;

    protected _eventEmitter: BoardEventEmitter;

    protected _websocket?: Socket;

    public constructor(eventEmitter: BoardEventEmitter) {
        this.scenes = [];
        this._eventEmitter = eventEmitter;
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

    public set websocket(socket: Socket) {
        this._websocket = socket;
    }

    public get websocket(): Socket {
        if (this._websocket === undefined) {
            throw new Error("Websocket is not initialized");
        }

        return this._websocket;
    }

    public getStage(): Container {
        return this.getApplication().stage;
    }

    public addScene(scene: Scene) {
        this.scenes.push(scene);
    }

    public changeScene(scene: Scene) {
        if (scene === this.currentScene) {
            return;
        }

        this.currentScene?.cleanup();
        this.currentScene = scene;
        this.currentScene.setActive();
    }

    public getScenes(): Scene[] {
        return this.scenes;
    }

    public get app(): Application {
        return this.getApplication();
    }

    public getSceneByName(name: string): Option<Scene> {
        return this.getScenes().find((scene) => {
            return scene.name === name;
        });
    }

    public get viewport(): Viewport {
        const scene = this.currentScene;
        if (!scene) {
            throw new Error("Failed to get viewport, there is no active scene");
        }

        return scene.viewport;
    }

    public get grid(): Grid {
        const scene = this.currentScene;
        if (!scene) {
            throw new Error("Failed to get grid, there is no active scene");
        }

        return scene.grid;
    }

    public get scene(): Option<Scene> {
        return this.currentScene;
    }

    public get eventEmitter(): BoardEventEmitter {
        return this._eventEmitter;
    }
}

var GEventEmitter = new BoardEventEmitter();

var boardApplication: Board = new Board(GEventEmitter);

export async function init(
    options?: Partial<ApplicationOptions>,
    socket?: Socket,
): Promise<Application> {
    const application = new Application();

    await application.init(options);

    boardApplication.setApplication(application);

    if (isDev()) {
        globalThis.__PIXI_APP__ = application;

        const scene = new Scene("init-scene");
        boardApplication.addScene(scene);
        boardApplication.changeScene(scene);

        boardApplication.websocket = SocketioWebsocket.createDefaultSocket();
    }

    globalThis.addEventListener("resize", () => {
        boardApplication.scenes.forEach((scene) => {
            scene.viewport.resize(
                boardApplication.app.canvas.width,
                boardApplication.app.canvas.height,
            );
        });
    });

    // TODO: setup websocket initialization
    if (socket) {
        boardApplication.websocket = socket;
    }

    console.log("Finished board init");
    return boardApplication.getApplication();
}

export function destroy(
    rendererDestroyOptions?: RendererDestroyOptions,
    options?: DestroyOptions,
) {
    boardApplication
        .getApplicationOptional()
        ?.destroy(rendererDestroyOptions, options);

    try {
        boardApplication.websocket.disconnect();
    } catch (error) {}

    GEventEmitter.removeAllListeners();
    boardApplication = new Board(GEventEmitter);
}

export { boardApplication as GBoard, GEventEmitter };
