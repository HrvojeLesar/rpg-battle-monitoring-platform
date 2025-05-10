import { Application } from "pixi.js";
import { Viewport } from "../viewport/viewport";
import { Grid } from "../grid";

export abstract class AbstractManager {
    public readonly app: Application;
    public readonly viewport: Viewport;
    public readonly grid: Grid;

    constructor(app: Application, grid: Grid, viewport: Viewport) {
        this.app = app;
        this.grid = grid;
        this.viewport = viewport;
    }
}
