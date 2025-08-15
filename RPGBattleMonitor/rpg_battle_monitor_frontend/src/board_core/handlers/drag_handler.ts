import { FederatedPointerEvent, Point } from "pixi.js";
import { ContainerExtension } from "../extensions/container_extension";
import { Scene } from "../scene";
import { SelectHandler } from "./select_handler";
import { EventStore } from "./registered_event_store";
import { UniqueCollection } from "../utils/unique_collection";
import { ClampPositionRegistry } from "../utils/clamp_position_registry";

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

        ClampPositionRegistry.get().tryClamp(
            this.container,
            newEntityPosition,
            this.handler.selectHandler,
        );
        this.handler.isDirty = true;
        this.container.position.set(newEntityPosition.x, newEntityPosition.y);
    }

    public registerDrag(container: ContainerExtension) {
        const onPointerDown = (event: FederatedPointerEvent) => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }
            event.stopPropagation();

            if (!this.selectHandler.isSelectionDraggable()) {
                return;
            }

            this.scene.viewport.pause = true;

            const localPos = event.getLocalPosition(this.scene.viewport);

            if (this.selectHandler.isMultiSelection()) {
                const holder = this.selectHandler.selectionHolderContainer;
                const offset = new Point();
                offset.x = localPos.x - holder.x;
                offset.y = localPos.y - holder.y;

                this.scene.viewport.on(
                    "globalpointermove",
                    this.onGlobalPointerMove,
                    {
                        handler: this,
                        offset: offset,
                        container: holder,
                    },
                );
            }

            const selections = this.selectHandler.selections;
            for (const selection of selections) {
                const offset = new Point();
                offset.x = localPos.x - selection.x;
                offset.y = localPos.y - selection.y;

                selection.addGhostToStage(selection.createGhost());

                this.scene.viewport.on(
                    "globalpointermove",
                    this.onGlobalPointerMove,
                    {
                        handler: this,
                        offset: offset,
                        container: selection,
                    },
                );
            }
        };

        const onPointerUp = (_event: FederatedPointerEvent) => {
            this.scene.viewport.off(
                "globalpointermove",
                this.onGlobalPointerMove,
            );
            this.scene.viewport.pause = false;

            const selectedItems = this.selectHandler.selections;
            for (const container of selectedItems) {
                if (this.isDirty) {
                    container.snapToGrid();
                }
                container.clearGhosts();
                container.getGridCellPosition();
            }

            this.selectHandler.drawSelectionOutline();

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
