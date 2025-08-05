import { FederatedPointerEvent, Point } from "pixi.js";
import { ContainerExtension } from "../extensions/container_extension";
import { Scene } from "../scene";
import { SelectHandler } from "./select_handler";
import { EventStore } from "./registered_event_store";
import { UniqueCollection } from "../utils/unique_collection";

type OnGlobalPointerMove = {
    handler: DragHandler;
    offset: Point;
    container: ContainerExtension;
};

export class DragHandler {
    public static UNREGISTER_DRAG: string = "UNREGISTER_DRAG";
    protected isDirty: boolean = false;

    protected scene: Scene;
    protected selectHandler: SelectHandler;
    protected eventStore: EventStore;

    protected managedContainers: UniqueCollection<ContainerExtension> =
        new UniqueCollection();

    public constructor(
        scene: Scene,
        selectHandler: SelectHandler,
        eventStore: EventStore,
    ) {
        this.scene = scene;
        this.selectHandler = selectHandler;
        this.eventStore = eventStore;
    }

    protected onGlobalPointerMove(
        this: OnGlobalPointerMove,
        event: FederatedPointerEvent,
    ) {
        const localPos = event.getLocalPosition(this.handler.scene.viewport);
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
                !this.selectHandler.isSelectionDraggable()
            ) {
                return;
            }

            this.scene.viewport.pause = true;

            const selectionHolder = this.selectHandler.selectionHolder;
            if (!selectionHolder) {
                return;
            }

            const offset = new Point();
            const localPos = event.getLocalPosition(this.scene.viewport);
            offset.x = localPos.x - selectionHolder.x;
            offset.y = localPos.y - selectionHolder.y;

            selectionHolder.createGhost();

            this.scene.viewport.on(
                "globalpointermove",
                this.onGlobalPointerMove,
                {
                    handler: this,
                    offset: offset,
                    container: selectionHolder,
                },
            );
        };

        const onPointerUp = (_event: FederatedPointerEvent) => {
            this.scene.viewport.off(
                "globalpointermove",
                this.onGlobalPointerMove,
            );
            this.scene.viewport.pause = false;

            const selectedItems = this.selectHandler.selections;
            this.selectHandler.deselectGroup();
            for (const container of selectedItems) {
                if (this.isDirty) {
                    container.snapToGrid();
                }
                container.clearGhosts();
            }
            this.selectHandler.selectGroup();

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

        this.eventStore.register(
            container,
            DragHandler.UNREGISTER_DRAG,
            unregisterDrag,
        );

        this.managedContainers.add(container);
    }

    public unregisterDrag(container: ContainerExtension) {
        this.managedContainers.remove(container);
        this.eventStore.unregister(container, DragHandler.UNREGISTER_DRAG);
    }
}
