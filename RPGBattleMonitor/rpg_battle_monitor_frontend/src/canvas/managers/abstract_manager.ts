import { Application } from "pixi.js";
import { Viewport } from "../viewport/viewport";
import { Grid } from "../grid";
import { ReactPixiJsBridgeEventEmitter } from "../../types/event_emitter";

export abstract class AbstractManager {
    public readonly app: Application;
    public readonly viewport: Viewport;
    public readonly grid: Grid;
    public readonly eventEmitter: ReactPixiJsBridgeEventEmitter;

    constructor(
        app: Application,
        grid: Grid,
        viewport: Viewport,
        eventEmitter: ReactPixiJsBridgeEventEmitter,
    ) {
        this.app = app;
        this.grid = grid;
        this.viewport = viewport;
        this.eventEmitter = eventEmitter;
    }
}
