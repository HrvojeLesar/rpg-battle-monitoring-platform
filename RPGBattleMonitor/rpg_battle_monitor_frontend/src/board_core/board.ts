import {
    Application,
    ApplicationOptions,
    Container,
    DestroyOptions,
    EventEmitter,
    RendererDestroyOptions,
} from "pixi.js";
import { isDev } from "../utils/dev_mode";
import { Socket } from "socket.io-client";
import { Scene } from "./scene";
import { Viewport } from "pixi-viewport";
import { Grid } from "./grid";

export type GameBoard = Board;

class Board {
    public scenes: Scene[];

    protected application?: Application;
    protected currentScene?: Scene;

    protected _eventEmitter: EventEmitter = new EventEmitter();

    // TODO: Make external global event handler
    protected websocket?: Socket;

    public constructor() {
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

    public get eventEmitter(): EventEmitter {
        return this._eventEmitter;
    }
}

var boardApplication: Board = new Board();

export async function init(
    options?: Partial<ApplicationOptions>,
): Promise<Application> {
    const application = new Application();

    await application.init(options);

    boardApplication.setApplication(application);

    if (isDev()) {
        globalThis.__PIXI_APP__ = application;

        console.log("Added init scene");
        const scene = new Scene("init-scene");
        boardApplication.addScene(scene);
        boardApplication.changeScene(scene);
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

    boardApplication = new Board();
}

export { boardApplication as GBoard };
