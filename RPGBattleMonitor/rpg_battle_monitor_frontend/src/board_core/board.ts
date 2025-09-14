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
import { GAtomStore } from "../board_react_wrapper/stores/state_store";
import { sceneAtoms } from "../board_react_wrapper/stores/board_store";

export type GameBoard = Board;

export type BoardInitOptions = {
    gameId: number;
};

class Board {
    protected application?: Application;
    protected currentScene?: Scene;

    protected _eventEmitter: BoardEventEmitter;

    protected _websocket?: Websocket;

    protected _entityRegistry: EntityRegistry;

    public constructor(eventEmitter: BoardEventEmitter) {
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
        GAtomStore.set(sceneAtoms.addScene, scene);
    }

    public changeScene(scene: Maybe<Scene>) {
        if (scene === undefined) {
            this.currentScene = undefined;
            return;
        }

        if (scene === this.currentScene) {
            return;
        }

        this.currentScene?.cleanup();
        this.currentScene = scene;
        this.currentScene.setActive();
    }

    public get app(): Application {
        return this.getApplication();
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
        return GAtomStore.get(sceneAtoms.getCurrentScene);
    }

    public get eventEmitter(): BoardEventEmitter {
        return this._eventEmitter;
    }

    public get entityRegistry(): EntityRegistry {
        return this._entityRegistry;
    }

    public removeScene(scene: Scene): void {
        GAtomStore.set(sceneAtoms.removeScene, scene);
    }
}

const GEventEmitter = new BoardEventEmitter();

let boardApplication: Board = new Board(GEventEmitter);

export async function init(
    boardInitOptions: BoardInitOptions,
    options?: Partial<ApplicationOptions>,
    socket?: Websocket,
): Promise<Application> {
    GEventEmitter.emit("board-init-started");
    const application = new Application();

    await application.init(options);

    boardApplication.setApplication(application);

    if (isDev()) {
        globalThis.__PIXI_APP__ = application;

        boardApplication.websocket = Websocket.createDefaultSocket(
            boardInitOptions.gameId,
        );
        initWebsocketListeners();
    }

    globalThis.addEventListener("resize", () => {
        // TODO: does not always work, manual window resize is still sometimes required
        GAtomStore.get(sceneAtoms.getScenes).forEach((scene) => {
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

    GEventEmitter.emit("board-init-finished");
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

    GEventEmitter.emit("board-destoryed");
    boardApplication = new Board(GEventEmitter);
}

function initWebsocketListeners() {
    boardApplication.websocket.socket.on("action", (message) => {
        switch (message.action) {
            case "update": {
                message.data.forEach((data) => {
                    const entity = boardApplication.entityRegistry.entities.get(
                        data.uid,
                    );
                    if (entity && entity.shouldApplyChanges(data)) {
                        entity.applyUpdateAction(data);
                    }
                });
                break;
            }
            case "create": {
                boardApplication.entityRegistry.queue(message.data);
                boardApplication.entityRegistry.convertQueuedEntities();
                break;
            }
            case "delete": {
                boardApplication.entityRegistry.queue(message.data);
                boardApplication.entityRegistry.removeQueuedEntities();
                break;
            }
        }
    });
}

export { boardApplication as GBoard, GEventEmitter };
