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

    entity.onpointerdown = (event) => {
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
    };

    entity.onpointerup = (_event) => {
        app.stage.eventMode = "passive";
        app.stage.onglobalpointermove = null;
    };
}
