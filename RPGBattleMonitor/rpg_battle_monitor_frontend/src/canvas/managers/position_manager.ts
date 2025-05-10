import { Application, Container, FederatedPointerEvent, Point } from "pixi.js";
import { EE } from "../../globals/event_emitter";
import { ViewportExtended } from "../viewport/viewport_extended";

type UnregisterPositionEvents = () => void;

export class PositionManager {
    protected app: Application;

    protected viewport: ViewportExtended;

    protected eventEmitter = EE;

    constructor(app: Application, viewport: ViewportExtended) {
        this.app = app;
        this.viewport = viewport;
    }

    public registerPositionEvents(entity: Container): UnregisterPositionEvents {
        const offset = new Point();

        const onPointerDown = (event: FederatedPointerEvent) => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            const localPos = event.getLocalPosition(this.viewport);
            offset.x = localPos.x - entity.x;
            offset.y = localPos.y - entity.y;
            this.viewport.pause = true;

            entity.createGhost();

            this.viewport.onglobalpointermove = (event) => {
                const localPos = event.getLocalPosition(this.viewport);
                entity.position.set(
                    localPos.x - offset.x,
                    localPos.y - offset.y,
                );
            };
        };

        const onPointerUp = (_event: FederatedPointerEvent) => {
            this.viewport.onglobalpointermove = null;
            this.viewport.pause = false;

            entity.snapToGrid();
            entity.removeGhosts();
        };

        entity.onpointerdown = onPointerDown;
        entity.onpointerup = onPointerUp;
        entity.onpointerupoutside = onPointerUp;

        const unregisterPositionEvents = () => {
            entity.onpointerdown = null;
            entity.onpointerup = null;
            entity.onpointerupoutside = null;
        };

        return unregisterPositionEvents;
    }
}
