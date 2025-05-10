import { Application } from "pixi.js";
import { Viewport } from "../viewport/viewport";
import { Grid } from "../grid";
import { AbstractManager } from "./abstract_manager";
import { PositionManager } from "./position_manager";

export class EntityManager extends AbstractManager {
    public readonly positionManager: PositionManager;

    public static default(
        app: Application,
        grid: Grid,
        viewport: Viewport,
        positionManager: PositionManager,
    ): EntityManager {
        const entityManager = new EntityManager(
            app,
            grid,
            viewport,
            positionManager,
        );

        app.stage.addChild(viewport);
        viewport.addChild(grid);

        return entityManager;
    }
    constructor(
        app: Application,
        grid: Grid,
        viewport: Viewport,
        positionManager: PositionManager,
    ) {
        super(app, grid, viewport);

        this.positionManager = positionManager;
    }
}
