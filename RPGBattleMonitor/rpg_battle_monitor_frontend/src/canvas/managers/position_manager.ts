import { Application, Container, FederatedMouseEvent, Point } from "pixi.js";
import { SelectionManager } from "./selection_manager";
import { EE } from "../../globals/event_emitter";

export class PositionManager {
    protected app: Application;

    protected selectionManager: SelectionManager;

    protected eventEmitter = EE;

    constructor(app: Application, selectionManager: SelectionManager) {
        this.app = app;
        this.selectionManager = selectionManager;
    }
}

export function registerPositionEvents(
    entity: Container,
    app: Application,
): void {
    let offset = new Point();

    function onPointerDown(event: FederatedMouseEvent) {
        const localPos = event.getLocalPosition(app.stage);
        // TODO: update this after zoom and scale logic is added
        // this will probably be wrong
        offset.x = localPos.x - entity.x;
        offset.y = localPos.y - entity.y;
        app.stage.eventMode = "static";

        app.stage.onglobalpointermove = (event) => {
            const localPos = event.getLocalPosition(app.stage);
            // TODO: update this after zoom and scale logic is added
            // this will probably be wrong
            entity.position.set(localPos.x - offset.x, localPos.y - offset.y);
        };
    }

    function onPointerUp(_event: FederatedMouseEvent) {
        app.stage.eventMode = "passive";
        app.stage.onglobalpointermove = null;

        snapToGrid(entity);
    }

    entity.onpointerdown = onPointerDown;
    entity.onpointerup = onPointerUp;
    entity.onpointerupoutside = onPointerUp;
}

function snapToGrid(entity: Container) {
    if (entity.snapToGrid !== true) {
        return;
    }

    // TODO: get grid configuration and actual grid size
    entity.position.x = Math.round(entity.position.x / 32) * 32;
    entity.position.y = Math.round(entity.position.y / 32) * 32;
}
