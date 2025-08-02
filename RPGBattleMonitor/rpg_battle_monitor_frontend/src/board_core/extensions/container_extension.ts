import { Container, ContainerOptions } from "pixi.js";
import { ContainerGhostHandler, Ghost } from "../utils/ghost";
import { GBoard } from "../board";
import { SelectionOutline } from "../selection/selected_item";

export type ContainerExtensionOptions = {
    isSnapping?: boolean;
    isDraggable?: boolean;
    isSelectable?: boolean;
} & ContainerOptions;

export class ContainerExtension<
    T extends Container = Container,
> extends Container {
    protected _isSnapping: boolean = false;
    protected _isDraggable: boolean = false;
    protected _isSelectable: boolean = false;
    protected _ghostHandler: ContainerGhostHandler;
    protected _selectionOutline: SelectionOutline;
    protected _displayedEntity?: T;

    public constructor(options?: ContainerExtensionOptions) {
        super(options);

        this._ghostHandler = new ContainerGhostHandler(this);

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
        return this._ghostHandler.createGhost();
    }

    public popGhost(): Option<Ghost> {
        return this._ghostHandler.popGhost();
    }

    public removeGhost(ghost: Ghost): Option<Ghost> {
        return this._ghostHandler.removeGhost(ghost);
    }

    public clearGhosts(): void {
        this._ghostHandler.clearGhosts();
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

    private registerDraggable() {
        GBoard.dragHandler.registerDrag(this);
    }

    private unregisterDraggable() {
        GBoard.dragHandler.unregisterDrag(this);
    }

    private registerSelectable() {
        GBoard.selectHandler.registerSelect(this);
    }

    private unregisterSelectable() {
        GBoard.selectHandler.unregisterSelect(this);
    }
}
