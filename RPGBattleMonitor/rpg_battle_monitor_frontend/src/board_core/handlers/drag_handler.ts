import { FederatedPointerEvent, Point } from "pixi.js";
import { ContainerExtension } from "../extensions/container_extension";
import { Scene } from "../scene";
import { SelectHandler } from "./select_handler";
import { EventStore } from "./registered_event_store";
import { UniqueCollection } from "../utils/unique_collection";
import { GBoard } from "../board";

export class DragHandler {
    public static UNREGISTER_DRAG: string = "UNREGISTER_DRAG";
    protected isDirty: boolean = false;

    protected scene: Scene;
    protected selectHandler: SelectHandler;
    protected eventStore: EventStore;

    protected globalPointerMoveUnregisterHandle: (() => void)[] = [];

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
        event: FederatedPointerEvent,
        offset: Point,
        container: ContainerExtension,
    ) {
        const localPos = event.getLocalPosition(this.scene.viewport);
        const newEntityPosition = new Point(
            localPos.x - offset.x,
            localPos.y - offset.y,
        );

        container.clampPositionToViewport(
            newEntityPosition,
            this.selectHandler,
        );

        this.isDirty = true;
        container.position.set(newEntityPosition.x, newEntityPosition.y);
    }

    protected onPointerDown(event: FederatedPointerEvent) {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }
        event.stopPropagation();

        if (!this.selectHandler.isSelectionDraggable()) {
            return;
        }

        const localPos = event.getLocalPosition(this.scene.viewport);

        if (this.selectHandler.isMultiSelection()) {
            const holder = this.selectHandler.selectionHolderContainer;
            const offset = new Point();
            offset.x = localPos.x - holder.x;
            offset.y = localPos.y - holder.y;

            const handle = this.onGlobalPointerMove.bind(
                this,
                event,
                offset,
                holder,
            );
            this.globalPointerMoveUnregisterHandle.push(handle);

            this.scene.viewport.on("globalpointermove", handle);
        }

        const selections = this.selectHandler.selections;
        for (const selection of selections) {
            const offset = new Point();
            offset.x = localPos.x - selection.x;
            offset.y = localPos.y - selection.y;

            selection.addGhostToStage(selection.createGhost());

            const selectionHandle = this.onGlobalPointerMove.bind(
                this,
                event,
                offset,
                selection,
            );
            this.globalPointerMoveUnregisterHandle.push(selectionHandle);
            this.scene.viewport.on("globalpointermove", selectionHandle);
        }
    }

    protected onPointerUp() {
        this.globalPointerMoveUnregisterHandle.forEach((handle) => {
            this.scene.viewport.off("globalpointermove", handle);
        });
        this.globalPointerMoveUnregisterHandle = [];

        const selectedItems = this.selectHandler.selections;
        for (const container of selectedItems) {
            if (this.isDirty) {
                container.snapToGrid();
                container.eventEmitter.emit("drag-end");
            }
            container.clearGhosts();
        }

        this.selectHandler.drawSelectionOutline();

        this.isDirty = false;

        GBoard.websocket.flush();
    }

    protected unregisterDragEvents(container: ContainerExtension) {
        container.off("pointerdown", this.onPointerDown.bind(this));
        container.off("pointerup", this.onPointerUp.bind(this));
        container.off("pointerupoutside", this.onPointerUp.bind(this));
    }

    public registerDrag(container: ContainerExtension) {
        container.on("pointerdown", this.onPointerDown.bind(this));
        container.on("pointerup", this.onPointerUp.bind(this));
        container.on("pointerupoutside", this.onPointerUp.bind(this));

        this.eventStore.register(
            container,
            DragHandler.UNREGISTER_DRAG,
            this.unregisterDragEvents.bind(this, container),
        );

        this.managedContainers.add(container);
    }

    public unregisterDrag(container: ContainerExtension) {
        this.managedContainers.remove(container);
        this.eventStore.unregister(container, DragHandler.UNREGISTER_DRAG);
    }
}
