import { Application, Container, FederatedPointerEvent, Point } from "pixi.js";
import { EE } from "../../globals/event_emitter";
import { Viewport } from "../viewport/viewport";
import { Grid } from "../grid";
import { AbstractManager } from "./abstract_manager";

type UnregisterPositionEvents = () => void;

export class PositionManager extends AbstractManager {
    protected eventEmitter = EE;

    public static default(
        app: Application,
        grid: Grid,
        viewport: Viewport,
    ): PositionManager {
        const positionManger = new PositionManager(app, grid, viewport);

        return positionManger;
    }

    constructor(app: Application, grid: Grid, viewport: Viewport) {
        super(app, grid, viewport);
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
                const newEntityPosition = new Point(
                    localPos.x - offset.x,
                    localPos.y - offset.y,
                );

                this.clampPositionToViewport(newEntityPosition, entity);
                entity.position.set(newEntityPosition.x, newEntityPosition.y);
            };
        };

        const onPointerUp = (_event: FederatedPointerEvent) => {
            this.viewport.onglobalpointermove = null;
            this.viewport.pause = false;

            entity.snapToGrid(this.grid);
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

    private clampPositionToViewport(position: Point, entity: Container) {
        const worldWidth = this.viewport.worldWidth;
        const worldHeight = this.viewport.worldHeight;

        if (position.x < 0) {
            position.x = 0;
        }

        if (position.y < 0) {
            position.y = 0;
        }

        if (position.x + entity.width > worldWidth) {
            position.x = worldWidth - entity.width;
        }

        if (position.y + entity.height > worldHeight) {
            position.y = worldHeight - entity.height;
        }
    }
}
