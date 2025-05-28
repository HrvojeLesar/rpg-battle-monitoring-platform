import { Application, Container } from "pixi.js";
import { Viewport } from "../viewport/viewport";
import { Grid } from "../grid";
import { AbstractManager } from "./abstract_manager";
import { PositionManager, UnregisterPositionEvents } from "./position_manager";
import { ReactPixiJsBridgeEventEmitter } from "../../types/event_emitter";
import { addItem, removeItem } from "../utils/unique_collection_interface";

export class EntityManager extends AbstractManager {
    public readonly positionManager: PositionManager;

    protected playableEntities: Container[] = [];
    protected cancelEventsCallbackMap: Map<
        Container,
        UnregisterPositionEvents
    > = new Map();

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
        // Cancel existing events registerd on entity if they exist
        const existingCallback = this.cancelEventsCallbackMap.get(entity);
        if (existingCallback !== undefined) {
            existingCallback();
        }

        this.addEntity(this.playableEntities, entity);
        const cancelEventsCallback =
            this.positionManager.registerPositionEvents(entity);

        this.cancelEventsCallbackMap.set(entity, cancelEventsCallback);

        entity.setBridgeEventEmitter(this.eventEmitter);
        this.viewport.addChild(entity);

        return entity;
    }

    public removePlayableEntity(entity: Container): Container {
        this.removeEntity(this.playableEntities, entity);

        const existingCallback = this.cancelEventsCallbackMap.get(entity);
        if (existingCallback !== undefined) {
            existingCallback();
        }
        this.cancelEventsCallbackMap.delete(entity);

        this.viewport.removeChild(entity);

        return entity;
    }

    private addEntity<T>(collection: T[], entity: T): T {
        return addItem(collection, entity);
    }

    private removeEntity<T>(collection: T[], entity: T): Option<T> {
        return removeItem(collection, entity);
    }
}
