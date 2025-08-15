import { Container, ContainerOptions, ObservablePoint, Point } from "pixi.js";
import { DragHandler } from "../handlers/drag_handler";
import { SelectHandler } from "../handlers/select_handler";
import { UniqueCollection } from "../utils/unique_collection";
import { GBoard } from "../board";
import { SelectionOutline } from "../selection/selection_outline";
import { ResizeKind } from "../handlers/resize_handler";
import { IResizable } from "../interfaces/resizable";
import { resize } from "../handlers/resizable";
import { IGridMove } from "../interfaces/grid_move";
import { GridCell, GridCellPosition } from "../grid/cell";
import { Grid } from "../grid/grid";

export type ContainerExtensionOptions = {
    isSnapping?: boolean;
    isDraggable?: boolean;
    isSelectable?: boolean;
    selectionOutline?: SelectionOutline;
    isResizable?: boolean;
} & ContainerOptions;

export type Ghost = ContainerExtension;

export type Handlers = {
    dragHandler: DragHandler;
    selectHandler: SelectHandler;
};

export class ContainerExtension<T extends Container = Container>
    extends Container
    implements IResizable, IGridMove
{
    protected _isSnapping: boolean = false;
    protected _isDraggable: boolean = false;
    protected _isSelectable: boolean = false;
    protected _isResizable: boolean = false;
    protected _displayedEntity?: T;
    protected _ghots: UniqueCollection<ContainerExtension> =
        new UniqueCollection();
    protected _grid: Grid;
    protected _gridCell: GridCell;

    public constructor(grid: Grid, options?: ContainerExtensionOptions) {
        super(options);

        this.isSnapping = options?.isSnapping ?? false;
        this.isDraggable = options?.isDraggable ?? false;
        this.isSelectable = options?.isSelectable ?? false;
        this.isResizable = options?.isResizable ?? false;

        this._grid = grid;

        this._gridCell = new GridCell(this);
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

    /**
     * Container can be draggable if it is selectable and has draggable flag set
     * */
    public get isDraggable(): boolean {
        if (this.isSelectable === false) {
            return false;
        }

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

    public get isResizable(): boolean {
        if (!this.displayedEntity) {
            return false;
        }

        if (this.isSelectable === false) {
            return false;
        }

        return this._isResizable;
    }

    public set isResizable(value: boolean) {
        this._isResizable = value;
    }

    public snapToGrid(force: boolean = false): void {
        if (this.isSnapping === false && force === false) {
            return;
        }

        this.position.x =
            Math.round(this.position.x / this._grid.cellSize) *
            this._grid.cellSize;
        this.position.y =
            Math.round(this.position.y / this._grid.cellSize) *
            this._grid.cellSize;
    }

    getInitialPosition(): ObservablePoint {
        return this.position;
    }

    getInitialHeight(): number {
        return this.displayedEntity?.height ?? this.height;
    }

    getInitialWidth(): number {
        return this.displayedEntity?.width ?? this.width;
    }

    resize(
        pointerPosition: Point,
        startPoint: Point,
        initialWidth: number,
        initialHeight: number,
        kind: ResizeKind,
    ): void {
        if (!this.displayedEntity) {
            return;
        }

        resize(
            this,
            this.displayedEntity,
            pointerPosition,
            startPoint,
            initialWidth,
            initialHeight,
            kind,
        );

        if (this.isSnapping) {
            if (kind === ResizeKind.Right) {
                this.displayedEntity.width =
                    Math.round(
                        this.displayedEntity.width / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
            }

            if (kind === ResizeKind.Bottom) {
                this.displayedEntity.height =
                    Math.round(
                        this.displayedEntity.height / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
            }

            if (kind === ResizeKind.Left) {
                this.position.x =
                    Math.round(this.position.x / (this._grid.cellSize / 2)) *
                    (this._grid.cellSize / 2);
                this.displayedEntity.width =
                    Math.round(
                        this.displayedEntity.width / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
            }

            if (kind === ResizeKind.Top) {
                this.position.y =
                    Math.round(this.position.y / (this._grid.cellSize / 2)) *
                    (this._grid.cellSize / 2);
                this.displayedEntity.height =
                    Math.round(
                        this.displayedEntity.height / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
            }

            if (kind === ResizeKind.BottomRight) {
                this.displayedEntity.width =
                    Math.round(
                        this.displayedEntity.width / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
                this.displayedEntity.height =
                    Math.round(
                        this.displayedEntity.height / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
            }

            if (kind === ResizeKind.TopRight) {
                this.position.y =
                    Math.round(this.position.y / (this._grid.cellSize / 2)) *
                    (this._grid.cellSize / 2);
                this.displayedEntity.height =
                    Math.round(
                        this.displayedEntity.height / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
                this.displayedEntity.width =
                    Math.round(
                        this.displayedEntity.width / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
            }

            if (kind === ResizeKind.BottomLeft) {
                this.displayedEntity.height =
                    Math.round(
                        this.displayedEntity.height / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
                this.position.x =
                    Math.round(this.position.x / (this._grid.cellSize / 2)) *
                    (this._grid.cellSize / 2);
                this.displayedEntity.width =
                    Math.round(
                        this.displayedEntity.width / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
            }

            if (kind === ResizeKind.TopLeft) {
                this.position.y =
                    Math.round(this.position.y / (this._grid.cellSize / 2)) *
                    (this._grid.cellSize / 2);
                this.displayedEntity.height =
                    Math.round(
                        this.displayedEntity.height / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
                this.position.x =
                    Math.round(this.position.x / (this._grid.cellSize / 2)) *
                    (this._grid.cellSize / 2);
                this.displayedEntity.width =
                    Math.round(
                        this.displayedEntity.width / (this._grid.cellSize / 2),
                    ) *
                    (this._grid.cellSize / 2);
            }
        }
    }

    protected createGhostContainer(): Ghost {
        if (this instanceof ContainerExtension) {
            return new ContainerExtension(this.grid, this);
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

    public addGhostToStage(ghost: Ghost): void {
        if (!this.displayedEntity) {
            return;
        }

        GBoard.viewport.addChildAt(ghost, GBoard.viewport.getChildIndex(this));
    }

    public removeGhostFromStage(ghost: Container): void {
        GBoard.viewport.removeChild(ghost);
    }

    public get grid(): Grid {
        return this._grid;
    }

    public getGridCellPosition(): GridCell {
        return this._gridCell.getGridCellPosition();
    }

    public moveToGridCell(position: GridCellPosition): void {
        this._gridCell.moveToGridCell(position);
    }
}
