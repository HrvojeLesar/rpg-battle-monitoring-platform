import { FederatedPointerEvent, Point } from "pixi.js";
import { GBoard } from "../board";
import { IContainerMixin } from "../mixins/container_mixin";

function onGlobalPointerMove(
    this: { offset: Point; container: IContainerMixin },
    event: FederatedPointerEvent,
) {
    console.log("drag???");
    const localPos = event.getLocalPosition(GBoard.viewport);
    const newEntityPosition = new Point(
        localPos.x - this.offset.x,
        localPos.y - this.offset.y,
    );

    DragHandler.clampPositionToViewport(this.container, newEntityPosition);
    this.container.position.set(newEntityPosition.x, newEntityPosition.y);
}

export class DragHandler {
    public static UNREGISTER_DRAG: string = "UNREGISTER_DRAG";

    public constructor() {}

    public registerDrag(container: IContainerMixin) {
        const onPointerDown = (event: FederatedPointerEvent) => {
            console.log("drag");
            // TODO: expected flow
            // 1. Check if left click
            // 2. Determine if selection is draggable (if any item in selection is not draggable disallow dragging)
            // 3. Create ghosts for each item dragged
            // 4. Determine bounding box of all selected items
            // 5. Handle dragging
            // 5.1. Disallow dragging outside of bounds, clamp bounding box to viewport
            // 6. If any item has snapping property all items snap
            // 7. Snap/place items on release

            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            if (container.isDraggable === false) {
                return;
            }

            GBoard.viewport.pause = true;

            const selectedItems = GBoard.selectHandler.selections;
            for (const container of selectedItems) {
                const offset = new Point();
                const localPos = event.getLocalPosition(GBoard.viewport);
                offset.x = localPos.x - container.x;
                offset.y = localPos.y - container.y;

                container.createGhost();

                GBoard.viewport.on("globalpointermove", onGlobalPointerMove, {
                    offset: offset,
                    container: container,
                });
            }
        };

        const onPointerUp = (_event: FederatedPointerEvent) => {
            GBoard.viewport.off("globalpointermove", onGlobalPointerMove);
            GBoard.viewport.pause = false;

            const selectedItems = GBoard.selectHandler.selections;
            for (const container of selectedItems) {
                this.snapToGrid(container);
                container.clearGhosts();
            }
        };

        container.on("pointerdown", onPointerDown);
        container.on("pointerup", onPointerUp);
        container.on("pointerupoutside", onPointerUp);

        const unregisterDrag = () => {
            container.off("pointerdown", onPointerDown);
            container.off("pointerup", onPointerUp);
            container.off("pointerupoutside", onPointerUp);
        };

        GBoard.eventStore.register(
            container,
            DragHandler.UNREGISTER_DRAG,
            unregisterDrag,
        );
    }

    public unregisterDrag(container: IContainerMixin) {
        GBoard.eventStore.unregister(container, DragHandler.UNREGISTER_DRAG);
    }

    private snapToGrid(container: IContainerMixin, force: boolean = false) {
        if (container.isSnapping === false && force === false) {
            return;
        }

        container.position.x =
            Math.round(container.position.x / GBoard.grid.cellSize) *
            GBoard.grid.cellSize;
        container.position.y =
            Math.round(container.position.y / GBoard.grid.cellSize) *
            GBoard.grid.cellSize;
    }

    public static clampPositionToViewport(
        container: IContainerMixin,
        position: Point,
    ) {
        const worldWidth = GBoard.viewport.worldWidth;
        const worldHeight = GBoard.viewport.worldHeight;

        if (position.x < 0) {
            position.x = 0;
        }

        if (position.y < 0) {
            position.y = 0;
        }

        if (position.x + container.width > worldWidth) {
            position.x = worldWidth - container.width;
        }

        if (position.y + container.height > worldHeight) {
            position.y = worldHeight - container.height;
        }
    }
}
