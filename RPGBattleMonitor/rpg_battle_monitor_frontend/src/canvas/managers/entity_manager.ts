import { Application, Container } from "pixi.js";
import { Viewport } from "../viewport/viewport";
import { Grid } from "../grid";
import { AbstractManager } from "./abstract_manager";
import { PositionManager } from "./position_manager";
import { ReactPixiJsBridgeEventEmitter } from "../../types/event_emitter";

export class EntityManager extends AbstractManager {
    public readonly positionManager: PositionManager;

    protected playableEntities: Container[] = [];

    public static default(
        app: Application,
        grid: Grid,
        viewport: Viewport,
        eventEmitter: ReactPixiJsBridgeEventEmitter,
    ): EntityManager {
        const positionManager = PositionManager.default(
            app,
            grid,
            viewport,
            eventEmitter,
        );

        const entityManager = new EntityManager(
            [app, grid, viewport, eventEmitter],
            positionManager,
        );

        app.stage.addChild(viewport);
        viewport.addChild(grid);

        return entityManager;
    }
    private constructor(
        params: ConstructorParameters<typeof AbstractManager>,
        positionManager: PositionManager,
    ) {
        super(...params);

        this.positionManager = positionManager;
    }

    public addPlayableEntity(entity: Container): Container {
        this.addEntity(this.playableEntities, entity);
        this.positionManager.registerPositionEvents(entity);

        return entity;
    }

    public removePlayableEntity(entity: Container): Container {
        this.removeEntity(this.playableEntities, entity);
        this.positionManager.registerPositionEvents(entity);

        return entity;
    }

    private addEntity<T>(collection: T[], entity: T): T {
        const entityIndex = collection.indexOf(entity);

        if (entityIndex !== -1) {
            collection.splice(entityIndex, 1);
        }

        return entity;
    }

    private removeEntity<T>(collection: T[], entity: T): Option<T> {
        const entityIndex = collection.indexOf(entity);

        if (entityIndex !== -1) {
            const removedEntity = collection[entityIndex];
            collection.splice(entityIndex, 1);

            return removedEntity;
        }

        return null;
    }
}
