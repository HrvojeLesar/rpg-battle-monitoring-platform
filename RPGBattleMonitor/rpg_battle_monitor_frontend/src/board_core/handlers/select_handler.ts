import { FederatedPointerEvent, Rectangle } from "pixi.js";
import { UniqueCollection } from "../utils/unique_collection";
import { ContainerExtension } from "../extensions/container_extension";
import { EventStore } from "./registered_event_store";
import { Scene } from "../scene";
import { SelectionOutline } from "../selection/selection_outline";
import { SingleSelectionOutline } from "../selection/single_selection_outline";
import {
    SelectionHolder,
    SelectionHolderContainer,
} from "../selection/selection_holder";
import { ResizeHandler } from "./resize_handler";

export class SelectHandler {
    public static UNREGISTER_SELECT: string = "UNREGISTER_SELECT";

    protected _selected: UniqueCollection<ContainerExtension> =
        new UniqueCollection();

    protected scene: Scene;
    protected eventStore: EventStore;
    protected selectionHolderContainer: SelectionHolderContainer;
    protected outlines: Map<ContainerExtension, SelectionOutline> = new Map();
    protected _resizeHandler: ResizeHandler;

    protected managedContainers: UniqueCollection<ContainerExtension> =
        new UniqueCollection();

    public constructor(scene: Scene, eventStore: EventStore) {
        this.scene = scene;
        this.eventStore = eventStore;
        this._resizeHandler = new ResizeHandler(this, this.scene);

        this.selectionHolderContainer = new SelectionHolderContainer(this);
        this.scene.viewport.addChild(this.selectionHolderContainer);
    }

    public get selections(): Readonly<ContainerExtension[]> {
        return this._selected.items;
    }

    public select(container: ContainerExtension): void {
        this._selected.add(container);
        console.log("selected", this._selected.items);
        const outline = new SingleSelectionOutline(container, this);
        this.outlines.get(container)?.destroy();

        this.outlines.set(container, outline);
        this.scene.viewport.addChild(outline);
    }

    public deselect(container: ContainerExtension): void {
        this._selected.remove(container);
        console.log("deselect", this._selected.items);
        this.outlines.get(container)?.destroy();
    }

    public isSelected(container: ContainerExtension): boolean {
        return this._selected.contains(container);
    }

    public registerSelect(container: ContainerExtension) {
        const onPointerDown = (event: FederatedPointerEvent) => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            const target = event.target;
            if (!(target instanceof ContainerExtension)) {
                return;
            }

            if (!this.isSelected(target) && target.isSelectable) {
                this.clearSelections();
                this.select(target);
                this.selectGroup();
            }
        };

        container.on("pointerdown", onPointerDown);

        const unregister = () => {
            container.off("pointerdown", onPointerDown);
        };

        this.eventStore.register(
            container,
            SelectHandler.UNREGISTER_SELECT,
            unregister,
        );

        this.managedContainers.add(container);
    }

    public unregisterSelect(container: ContainerExtension) {
        this.deselect(container);
        this.managedContainers.remove(container);
        this.eventStore.unregister(container, SelectHandler.UNREGISTER_SELECT);
    }

    public clearSelections() {
        this.deselectGroup();
        for (const key of this.outlines.keys()) {
            this.outlines.get(key)?.destroy();
        }
        this._selected.clear();
        console.log("clear", this._selected.items);
    }

    public isMultiSelection(): boolean {
        return this.selections.length > 1;
    }

    public selectGroup(): void {
        if (this.selections.length === 0) {
            return;
        }

        const selectionHolder = this.selectionHolder;

        const selectionRectangle = this.findSelectionRectangle();

        selectionHolder.position.set(
            selectionRectangle.x,
            selectionRectangle.y,
        );

        this.scene.viewport.addChildAt(
            selectionHolder,
            this.scene.viewport.getChildIndex(this.selections[0]),
        );

        this.putSelectionsIntoHolder();
    }

    public deselectGroup(): void {
        const selectionHolder = this.selectionHolder;
        const isHolderOnStage =
            selectionHolder &&
            this.scene.viewport.children.indexOf(selectionHolder) !== -1;
        if (selectionHolder && isHolderOnStage) {
            let index = this.scene.viewport.getChildIndex(selectionHolder);
            const children = [...selectionHolder.children];

            children.forEach((c) => {
                if (c instanceof ContainerExtension) {
                    this.scene.viewport.addChildAt(c, index++);
                    c.position = c.position.add(selectionHolder.position);
                }
            });
        }
    }

    public get selectionHolder(): SelectionHolder {
        return this.selectionHolderContainer.holder;
    }

    public get resizeHandler(): ResizeHandler {
        return this._resizeHandler;
    }

    public isContainerInSelection(container: ContainerExtension): boolean {
        return this.selections.find((s) => s === container) !== undefined;
    }

    public isSelectionDraggable(): boolean {
        return this.selections.every((s) => s.isDraggable);
    }

    public isSelectionResizable(): boolean {
        return this.selections.every((s) => s.isResizable);
    }

    protected findSelectionRectangle(): Rectangle {
        let rect: Rectangle = new Rectangle();
        this.selections.forEach((s, idx) => {
            const other = s.position;
            const otherWidth = s.displayedEntity?.width ?? s.width;
            const otherHeight = s.displayedEntity?.height ?? s.height;

            if (idx === 0 || rect.x > other.x) {
                rect.x = other.x;
            }
            if (idx === 0 || rect.y > other.y) {
                rect.y = other.y;
            }

            if (idx === 0 || rect.width < otherWidth) {
                rect.width = otherWidth;
            }
            if (idx === 0 || rect.height < otherHeight) {
                rect.height = otherHeight;
            }
        });

        return rect;
    }

    protected putSelectionsIntoHolder(): void {
        const selectionHolder = this.selectionHolder;
        if (selectionHolder) {
            this.selections.forEach((s) => {
                const localPositionToContainer =
                    s.position.subtract(selectionHolder);
                s.position.set(
                    localPositionToContainer.x,
                    localPositionToContainer.y,
                );
                this.scene.viewport.removeChild(s);
                selectionHolder.addChild(s);
            });
        }
    }
}
