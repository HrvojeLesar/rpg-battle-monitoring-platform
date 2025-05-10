import { Application } from "pixi.js";
import { Viewport } from "../viewport/viewport";
import { Grid } from "../grid";
import { PositionManager } from "./position_manager";
import { EntityManager } from "./entity_manager";
import { AbstractManager } from "./abstract_manager";
import { ReactPixiJsBridgeEventEmitter } from "../../types/event_emitter";

export class ApplicationManager extends AbstractManager {
    public readonly entityManager: EntityManager;

    public static default(
        app: Application,
        eventEmitter: ReactPixiJsBridgeEventEmitter,
    ) {
        const grid = new Grid(app);
        const viewport = Viewport.default(app, grid);
        const applicationManager = new ApplicationManager([
            app,
            grid,
            viewport,
            eventEmitter,
        ]);

        return applicationManager;
    }

    private constructor(params: ConstructorParameters<typeof AbstractManager>) {
        super(...params);

        this.entityManager = EntityManager.default(
            this.app,
            this.grid,
            this.viewport,
            this.eventEmitter,
        );
    }
}
