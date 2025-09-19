import { Container, FederatedPointerEvent, Point, Sprite } from "pixi.js";
import { UniqueCollection } from "../utils/unique_collection";
import { ContainerExtension } from "../extensions/container_extension";
import { EventStore } from "./registered_event_store";
import { Scene } from "../scene";
import { SelectionOutline } from "../selection/selection_outline";
import { SingleSelectionOutline } from "../selection/single_selection_outline";
import { ResizeHandler } from "./resize_handler";
import { SelectionBox } from "../selection/selection_box";
import { SelectedMap } from "../utils/selected_map";
import { SelectionHolderContainer } from "../selection/selection_holder";
import { GBoard } from "../board";

export enum SelectionState {
    None = "None",
    Selection = "Selection",
    BoxSelecting = "BoxSelecting",
}

export type SelectedItemMeta = {
    viewportPositionIndex: number;
    outline: SelectionOutline;
};

export class SelectHandler {
    public static UNREGISTER_SELECT: string = "UNREGISTER_SELECT";

    protected _selected: SelectedMap;

    protected _scene: Scene;
    protected eventStore: EventStore;
    public selectionHolderContainer: SelectionHolderContainer;
    protected _resizeHandler: ResizeHandler;
    protected _selectionState: SelectionState = SelectionState.None;
    protected selectionBox: SelectionBox;

    protected clampWidthRight: boolean = false;
    protected clampWidthLeft: boolean = false;
    protected clampHeightTop: boolean = false;
    protected clampHeightBottom: boolean = false;

    protected managedContainers: UniqueCollection<ContainerExtension> =
        new UniqueCollection();

    public constructor(scene: Scene, eventStore: EventStore) {
        this._scene = scene;
        this.eventStore = eventStore;
        this._resizeHandler = new ResizeHandler(this, this._scene);
        this.selectionBox = new SelectionBox(this._scene.viewport, this);

        this.selectionHolderContainer = new SelectionHolderContainer(
            this.scene.grid,
            this,
        );
        this._scene.viewport.addChild(this.selectionHolderContainer);

        this._selected = new SelectedMap();
    }

    public get selections(): Readonly<ContainerExtension[]> {
        return this._selected.selections;
    }

    public select(container: ContainerExtension): void {
        if (this.isSelected(container)) {
            this.deselect(container);
        }

        const meta = {
            viewportPositionIndex:
                this._scene.viewport.children.indexOf(container),
            outline: new SingleSelectionOutline(container, this),
        };
        this._selected.set(container, meta);
        this._scene.viewport.addChild(meta.outline);

        if (this.isMultiSelection()) {
            this.drawSelectionOutline();
        }
    }

    public deselect(container: ContainerExtension): void {
        this._selected.delete(container);

        if (this.isMultiSelection()) {
            this.drawSelectionOutline();
        }
    }

    public isSelected(container: ContainerExtension): boolean {
        return this._selected.get(container) !== undefined;
    }

    public registerSelect(container: ContainerExtension): void {
        const onPointerDown = (event: FederatedPointerEvent) => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            const target = event.target;
            if (!(target instanceof ContainerExtension)) {
                return;
            }

            if (target.isSelectable && !this.isSelected(target)) {
                this.clearSelections();
                this.select(target);
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

    public clearSelections(): void {
        this.setClampWidthLeft(false);
        this.setClampWidthRight(false);
        this.setClampHeightTop(false);
        this.setClampHeightBottom(false);
        this._selected.clear();
    }

    public isMultiSelection(): boolean {
        return this.selections.length > 1;
    }

    public drawSelectionOutline(): void {
        const startPoint = this.findSelectionStartPoint();
        this.selectionHolderContainer.position.set(startPoint.x, startPoint.y);
        const selectionHolder = this.selectionHolderContainer.holder;
        selectionHolder.removeChildren();

        this.selections.forEach((s) => {
            const localPositionToContainer = s.position.subtract(
                this.selectionHolderContainer.position,
            );
            const dummySprite = new Sprite({
                x: localPositionToContainer.x,
                y: localPositionToContainer.y,
                width: s.width,
                height: s.height,
                rotation: s.rotation,
            });
            selectionHolder.addChild(dummySprite);
        });
    }

    public get resizeHandler(): ResizeHandler {
        return this._resizeHandler;
    }

    public get scene(): Scene {
        return this._scene;
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

    public findSelectionStartPoint(): Point {
        function getTopAndLeftMostPoint(container: Container): Point {
            const x = container.x;
            const y = container.y;

            if (container.angle % 360 === 0) {
                return new Point(x, y);
            }

            const rotation = container.rotation;
            const width = container.width;
            const height = container.height;

            const cosine = Math.cos(rotation);
            const sine = Math.sin(rotation);

            const corners = [
                new Point(x, y), // Top left, does not change with rotation
                new Point(x + width * cosine, y + width * sine), // Top right
                new Point(
                    x + width * cosine - height * sine,
                    y + width * sine + height * cosine,
                ), // Bottom right
                new Point(x - height * sine, y + height * cosine), // Bottom left
            ];

            return corners.reduce(
                (acc, point) => {
                    if (acc.x > point.x) {
                        acc.x = point.x;
                    }

                    if (acc.y > point.y) {
                        acc.y = point.y;
                    }

                    return acc;
                },
                new Point(x, y),
            );
        }

        const point = new Point();
        this.selections.forEach((s, idx) => {
            const other = getTopAndLeftMostPoint(s);
            if (idx === 0 || point.x > other.x) {
                point.x = other.x;
            }
            if (idx === 0 || point.y > other.y) {
                point.y = other.y;
            }
        });

        return point;
    }

    public getClampWidthLeft(): boolean {
        return this.clampWidthLeft;
    }

    public setClampWidthLeft(value: boolean): void {
        this.clampWidthLeft = value;
    }

    public getClampWidthRight(): boolean {
        return this.clampWidthRight;
    }

    public setClampWidthRight(value: boolean): void {
        this.clampWidthRight = value;
    }

    public getClampHeightTop(): boolean {
        return this.clampHeightTop;
    }

    public setClampHeightTop(value: boolean): void {
        this.clampHeightTop = value;
    }

    public getClampHeightBottom(): boolean {
        return this.clampHeightBottom;
    }

    public setClampHeightBottom(value: boolean): void {
        this.clampHeightBottom = value;
    }

    public isActive(): boolean {
        return this._scene.viewport.pause === false;
    }

    public deleteSelected(): void {
        if (!this.isActive()) {
            return;
        }

        const selections = this.selections;
        this.clearSelections();

        const deleteActions = selections.map((selection) => {
            const deleteAction =
                GBoard.entityRegistry.entities.remove(selection);

            for (const entity of deleteAction.acc) {
                GBoard.websocket.queue(entity, "deleteQueue");
            }

            return deleteAction;
        });

        GBoard.websocket.flush();

        deleteActions.forEach((action) =>
            action.cleanupCallbacks.forEach((cb) => cb()),
        );
    }
}
