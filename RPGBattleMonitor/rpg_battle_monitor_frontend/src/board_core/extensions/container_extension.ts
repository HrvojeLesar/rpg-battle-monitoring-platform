import { Container, ContainerOptions, Point } from "pixi.js";
import { SelectionOutline } from "../selection/selected_item";
import { GDragHandler } from "../handlers/drag_handler";
import { GSelectHandler } from "../handlers/select_handler";
import { UniqueCollection } from "../utils/unique_collection";
import { GBoard } from "../board";

export type ContainerExtensionOptions = {
    isSnapping?: boolean;
    isDraggable?: boolean;
    isSelectable?: boolean;
} & ContainerOptions;

export type Ghost = ContainerExtension;

export class ContainerExtension<
    T extends Container = Container,
> extends Container {
    protected _isSnapping: boolean = false;
    protected _isDraggable: boolean = false;
    protected _isSelectable: boolean = false;
    protected _selectionOutline: SelectionOutline;
    protected _displayedEntity?: T;
    protected _ghots: UniqueCollection<ContainerExtension> =
        new UniqueCollection();

    public constructor(options?: ContainerExtensionOptions) {
        super(options);

        this.isSnapping = options?.isSnapping || false;
        this.isDraggable = options?.isDraggable || false;
        this.isSelectable = options?.isSelectable || false;
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

        this.addToContainerStage(ghost);

        return ghost;
    }

    public popGhost(): Option<Ghost> {
        const ghost = this._ghots.pop();

        if (ghost) {
            this.removeFromContainerStage(ghost);
        }

        return ghost;
    }

    public removeGhost(ghost: Ghost): Option<Ghost> {
        const removedGhost = this._ghots.remove(ghost);

        this.removeFromContainerStage(ghost);

        return removedGhost;
    }

    public clearGhosts(): void {
        const ghosts = this._ghots.clear();

        for (const ghost of ghosts) {
            this.removeFromContainerStage(ghost);
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

    public cleanup() {
        this.unregisterDraggable();
        this.unregisterSelectable();
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
            eventMode: "passive",
        };
    }

    private registerDraggable() {
        GDragHandler.registerDrag(this);
    }

    private unregisterDraggable() {
        GDragHandler.unregisterDrag(this);
    }

    private registerSelectable() {
        GSelectHandler.registerSelect(this);
    }

    private unregisterSelectable() {
        GSelectHandler.unregisterSelect(this);
    }

    private addToContainerStage(ghost: Ghost): void {
        if (!this.displayedEntity) {
            return;
        }

        GBoard.viewport.addChildAt(ghost, GBoard.viewport.getChildIndex(this));
    }

    private removeFromContainerStage(ghost: Container): void {
        GBoard.viewport.removeChild(ghost);
    }
}
