import { Container, ContainerOptions, DestroyOptions, Point } from "pixi.js";
import { GDragHandler } from "../handlers/drag_handler";
import { GSelectHandler } from "../handlers/select_handler";
import { UniqueCollection } from "../utils/unique_collection";
import { GBoard } from "../board";
import { SelectionOutline } from "../selection/selection_outline";

export type ContainerExtensionOptions = {
    isSnapping?: boolean;
    isDraggable?: boolean;
    isSelectable?: boolean;
    selectionOutline?: SelectionOutline;
    isResizable?: boolean;
} & ContainerOptions;

export type Ghost = ContainerExtension;

export class ContainerExtension<
    T extends Container = Container,
> extends Container {
    protected _isSnapping: boolean = false;
    protected _isDraggable: boolean = false;
    protected _isSelectable: boolean = false;
    protected _isResizable: boolean = false;
    protected _selectionOutline: SelectionOutline;
    protected _displayedEntity?: T;
    protected _ghots: UniqueCollection<ContainerExtension> =
        new UniqueCollection();

    public constructor(options?: ContainerExtensionOptions) {
        super(options);

        this.isSnapping = options?.isSnapping ?? false;
        this.isDraggable = options?.isDraggable ?? false;
        this.isSelectable = options?.isSelectable ?? false;
        this.isResizable = options?.isResizable ?? false;
        this._selectionOutline = new SelectionOutline(this);

        this.addChild(this._selectionOutline);

        // WARN: Order matters
        this.registerSelectable();
        this.registerDraggable();
    }

    public get isSnapping(): boolean {
        return this._isSnapping;
    }

    public set isSnapping(value: boolean) {
        this._isSnapping = value;
    }

    public createGhost(): Ghost {
        const ghost = this.createGhostContainer();
        this._ghots.add(ghost);

        return ghost;
    }

    public popGhost(): Option<Ghost> {
        const ghost = this._ghots.pop();

        return ghost;
    }

    public removeGhost(ghost: Ghost): Option<Ghost> {
        const removedGhost = this._ghots.remove(ghost);

        return removedGhost;
    }

    public clearGhosts(): void {
        const ghosts = this._ghots.clear();

        for (const ghost of ghosts) {
            this.removeGhostFromStage(ghost);
            ghost.destroy();
        }
    }

    public get isDraggable(): boolean {
        return this._isDraggable;
    }

    public set isDraggable(value: boolean) {
        this._isDraggable = value;
    }

    public get isSelectable(): boolean {
        return this._isSelectable;
    }

    public set isSelectable(value: boolean) {
        this._isSelectable = value;
    }

    public get displayedEntity(): Maybe<T> {
        return this._displayedEntity;
    }

    public set displayedEntity(value: Maybe<T>) {
        this._displayedEntity = value;
    }

    public get isRenderable(): boolean {
        return this._isResizable;
    }

    public set isResizable(value: boolean) {
        this._isResizable = value;
    }

    public destroy(options?: DestroyOptions) {
        this.unregisterDraggable();
        this.unregisterSelectable();
        super.destroy(options);
    }

    public snapToGrid(force: boolean = false): void {
        if (this.isSnapping === false && force === false) {
            return;
        }

        this.position.x =
            Math.round(this.position.x / GBoard.grid.cellSize) *
            GBoard.grid.cellSize;
        this.position.y =
            Math.round(this.position.y / GBoard.grid.cellSize) *
            GBoard.grid.cellSize;
    }

    public clampPositionToViewport(position: Point) {
        const worldWidth = GBoard.viewport.worldWidth;
        const worldHeight = GBoard.viewport.worldHeight;

        if (position.x < 0) {
            position.x = 0;
        }

        if (position.y < 0) {
            position.y = 0;
        }

        const width = this.displayedEntity?.width ?? this.width;
        if (position.x + width > worldWidth) {
            position.x = worldWidth - width;
        }

        const height = this.displayedEntity?.height ?? this.height;
        if (position.y + height > worldHeight) {
            position.y = worldHeight - height;
        }
    }

    protected createGhostContainer(): Ghost {
        if (this instanceof ContainerExtension) {
            return new ContainerExtension(this);
        }

        throw new Error("Creating a ghost of an unhandled type:", this);
    }

    protected cloneContainerOptions(
        container: ContainerExtension,
    ): ContainerExtensionOptions {
        return {
            position: new Point(container.position.x, container.position.y),
            eventMode: "none",
        };
    }

    public registerDraggable() {
        GDragHandler.registerDrag(this);
    }

    public unregisterDraggable() {
        GDragHandler.unregisterDrag(this);
    }

    public registerSelectable() {
        GSelectHandler.registerSelect(this);
    }

    public unregisterSelectable() {
        GSelectHandler.unregisterSelect(this);
    }

    protected addGhostToStage(ghost: Ghost): void {
        if (!this.displayedEntity) {
            return;
        }

        GBoard.viewport.addChildAt(ghost, GBoard.viewport.getChildIndex(this));
    }

    protected removeGhostFromStage(ghost: Container): void {
        GBoard.viewport.removeChild(ghost);
    }
}
