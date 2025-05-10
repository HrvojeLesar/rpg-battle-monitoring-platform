import { Application } from "pixi.js";
import { Viewport } from "../viewport/viewport";
import { Grid } from "../grid";
import { PositionManager } from "./position_manager";
import { EntityManager } from "./entity_manager";
import { AbstractManager } from "./abstract_manager";

export class ApplicationManager extends AbstractManager {
    public readonly positionManager: PositionManager;
    public readonly entityManager: EntityManager;

    public static default(app: Application) {
        const grid = new Grid(app);
        const viewport = Viewport.default(app, grid);
        const applicationManager = new ApplicationManager(app, grid, viewport);

        return applicationManager;
    }

    private constructor(app: Application, grid: Grid, viewport: Viewport) {
        super(app, grid, viewport);

        this.positionManager = PositionManager.default(
            this.app,
            this.grid,
            this.viewport,
        );
        this.entityManager = EntityManager.default(
            this.app,
            this.grid,
            this.viewport,
            this.positionManager,
        );
    }
}
