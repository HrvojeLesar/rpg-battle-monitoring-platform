import { FederatedPointerEvent, Point } from "pixi.js";
import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";
import { GEventStore } from "./registered_event_store";
import { GSelectHandler } from "./select_handler";

type OnGlobalPointerMove = {
    handler: DragHandler;
    offset: Point;
    container: ContainerExtension;
};

export class DragHandler {
    public static UNREGISTER_DRAG: string = "UNREGISTER_DRAG";
    protected isDirty: boolean = false;

    public constructor() {}

    protected onGlobalPointerMove(
        this: OnGlobalPointerMove,
        event: FederatedPointerEvent,
    ) {
        const localPos = event.getLocalPosition(GBoard.viewport);
        const newEntityPosition = new Point(
            localPos.x - this.offset.x,
            localPos.y - this.offset.y,
        );

        this.container.clampPositionToViewport(newEntityPosition);
        this.handler.isDirty = true;
        this.container.position.set(newEntityPosition.x, newEntityPosition.y);
    }

    public registerDrag(container: ContainerExtension) {
        const onPointerDown = (event: FederatedPointerEvent) => {
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
            event.stopPropagation();

            if (
                container.isDraggable === false ||
                container.isSelectable === false ||
                !GSelectHandler.isSelectionDraggable()
            ) {
                return;
            }

            GBoard.viewport.pause = true;

            let selectedItems = GSelectHandler.selections;
            if (selectedItems.length > 1 && GSelectHandler.selectionHolder) {
                selectedItems = [GSelectHandler.selectionHolder];
            }

            const selectionHolder = GSelectHandler.selectionHolder;
            if (!selectionHolder) {
                return;
            }

            const offset = new Point();
            const localPos = event.getLocalPosition(GBoard.viewport);
            offset.x = localPos.x - selectionHolder.x;
            offset.y = localPos.y - selectionHolder.y;

            selectionHolder.createGhost();

            GBoard.viewport.on("globalpointermove", this.onGlobalPointerMove, {
                handler: this,
                offset: offset,
                container: selectionHolder,
            });
        };

        const onPointerUp = (_event: FederatedPointerEvent) => {
            GBoard.viewport.off("globalpointermove", this.onGlobalPointerMove);
            GBoard.viewport.pause = false;

            const selectedItems = GSelectHandler.selections;
            GSelectHandler.deselectGroup();
            for (const container of selectedItems) {
                if (this.isDirty) {
                    container.snapToGrid();
                }
                container.clearGhosts();
            }
            GSelectHandler.selectGroup();

            this.isDirty = false;
        };

        container.on("pointerdown", onPointerDown);
        container.on("pointerup", onPointerUp);
        container.on("pointerupoutside", onPointerUp);

        const unregisterDrag = () => {
            container.off("pointerdown", onPointerDown);
            container.off("pointerup", onPointerUp);
            container.off("pointerupoutside", onPointerUp);
        };

        GEventStore.register(
            container,
            DragHandler.UNREGISTER_DRAG,
            unregisterDrag,
        );
    }

    public unregisterDrag(container: ContainerExtension) {
        GEventStore.unregister(container, DragHandler.UNREGISTER_DRAG);
    }
}

export const GDragHandler = new DragHandler();
