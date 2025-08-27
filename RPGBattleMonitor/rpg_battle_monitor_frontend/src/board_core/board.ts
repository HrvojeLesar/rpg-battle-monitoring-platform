import {
    Application,
    ApplicationOptions,
    Container,
    DestroyOptions,
    RendererDestroyOptions,
} from "pixi.js";
import { isDev } from "../utils/dev_mode";
import { Scene } from "./scene";
import { Viewport } from "pixi-viewport";
import "./mixins/point_mixin";
import { BoardEventEmitter } from "./events/board_event_emitters";
import { Grid } from "./grid/grid";
import { Websocket } from "../websocket/websocket";
import { EntityRegistry } from "./registry/entity_registry";

export type GameBoard = Board;

class Board {
    public scenes: Scene[];

    protected application?: Application;
    protected currentScene?: Scene;

    protected _eventEmitter: BoardEventEmitter;

    protected _websocket?: Websocket;

    protected _entityRegistry: EntityRegistry;

    public constructor(eventEmitter: BoardEventEmitter) {
        this.scenes = [];
        this._eventEmitter = eventEmitter;

        this._entityRegistry = EntityRegistry.defaultEntityRegistry();
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

    public set websocket(socket: Websocket) {
        this._websocket = socket;
    }

    public get websocket(): Websocket {
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

    public get entityRegistry(): EntityRegistry {
        return this._entityRegistry;
    }
}

var GEventEmitter = new BoardEventEmitter();

var boardApplication: Board = new Board(GEventEmitter);

export async function init(
    options?: Partial<ApplicationOptions>,
    socket?: Websocket,
): Promise<Application> {
    const application = new Application();

    await application.init(options);

    boardApplication.setApplication(application);

    if (isDev()) {
        globalThis.__PIXI_APP__ = application;

        const scene = new Scene({ name: "init-scene" });
        boardApplication.addScene(scene);
        boardApplication.changeScene(scene);

        boardApplication.websocket = Websocket.createDefaultSocket();
        initWebsocketListeners();
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
    boardApplication.websocket.initJoin();

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
        boardApplication.websocket.socket.disconnect();
    } catch (error) {}

    GEventEmitter.removeAllListeners();
    boardApplication = new Board(GEventEmitter);
}

function initWebsocketListeners() {
    boardApplication.websocket.socket.on("update", (data) => {
        data.forEach((data) => {
            const entity = boardApplication.entityRegistry.entities.get(
                data.uid,
            );
            // TODO: only apply if timestamp is not behind the current timestamp
            if (entity) {
                entity.applyUpdateAction(data);
            }
        });
    });
}

export { boardApplication as GBoard, GEventEmitter };
