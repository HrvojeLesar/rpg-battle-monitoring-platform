import {
    Container,
    ContainerOptions,
    EventEmitter,
    EventMode,
    ObservablePoint,
    Point,
} from "pixi.js";
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
import { IClampPositionToViewport } from "../interfaces/clamp_position_to_viewport";
import {
    DeleteAction,
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "../interfaces/messagable";
import newUId from "../utils/uuid_generator";
import { ContainerEventTypes } from "../events/container_extensions_events";

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

export type ContainerExtensionAttributes = {
    gridUid: UId;
    width: number;
    height: number;
    position: {
        x: number;
        y: number;
    };
    isSnapping?: boolean;
    isDraggable?: boolean;
    isSelectable?: boolean;
    isResizable?: boolean;
    eventMode?: EventMode;
    cursor?: string;
    rotation?: number;
};

export const DEFAULTS = {
    isSnapping: false,
    isDraggable: false,
    isSelectable: false,
    isResizable: false,
};

export abstract class ContainerExtension<
        T extends Container = Container,
        Attributes extends
            ContainerExtensionAttributes = ContainerExtensionAttributes,
    >
    extends Container
    implements
        IResizable,
        IGridMove,
        IClampPositionToViewport,
        IMessagable<Attributes>
{
    protected _isSnapping: boolean = DEFAULTS.isSnapping;
    protected _isDraggable: boolean = DEFAULTS.isDraggable;
    protected _isSelectable: boolean = DEFAULTS.isSelectable;
    protected _isResizable: boolean = DEFAULTS.isResizable;
    protected _displayedEntity?: T;
    protected _ghots: UniqueCollection<ContainerExtension> =
        new UniqueCollection();
    protected _grid: Grid;
    protected _gridCell: GridCell;
    protected _uid: UId;
    protected _dependants: UniqueCollection<IMessagable> =
        new UniqueCollection();
    private _eventEmitter = new EventEmitter<ContainerEventTypes>();
    protected _lastChangesTimestamp: Maybe<number> = undefined;

    public constructor(grid: Grid, options?: ContainerExtensionOptions) {
        super(options);

        this.isSnapping = options?.isSnapping ?? DEFAULTS.isSnapping;
        this.isDraggable = options?.isDraggable ?? DEFAULTS.isDraggable;
        this.isSelectable = options?.isSelectable ?? DEFAULTS.isSelectable;
        this.isResizable = options?.isResizable ?? DEFAULTS.isResizable;

        this._grid = grid;

        this._gridCell = new GridCell(this as ContainerExtension);
        this._uid = newUId();

        this.emit("added", this);
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
            this._grid.x +
            Math.round((this.position.x - this._grid.x) / this._grid.cellSize) *
                this._grid.cellSize;
        this.position.y =
            this._grid.y +
            Math.round((this.position.y - this._grid.y) / this._grid.cellSize) *
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

        // TODO: resize is still a bit janky and sometimes pixel off
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

    protected abstract createGhostContainer(): Ghost;

    protected cloneContainerOptions(
        container: ContainerExtension,
    ): ContainerExtensionOptions {
        return {
            position: new Point(container.position.x, container.position.y),
            angle: container.angle,
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

    public clampPositionToViewport(
        newPosition: Point,
        selectHandler: SelectHandler,
    ): void {
        const worldWidth = GBoard.viewport.worldWidth;
        const worldHeight = GBoard.viewport.worldHeight;

        if (newPosition.x < 0) {
            newPosition.x = 0;
        }

        if (newPosition.y < 0) {
            newPosition.y = 0;
        }

        const width = this.displayedEntity?.width ?? this.width;
        if (newPosition.x + width > worldWidth) {
            newPosition.x = worldWidth - width;
        }

        const height = this.displayedEntity?.height ?? this.height;
        if (newPosition.y + height > worldHeight) {
            newPosition.y = worldHeight - height;
        }

        // TODO: this.x is not always the correct position
        // moving the selection container faster can cause the
        // selected elements to sometimes be incorrectly offset form the
        // correct point
        if (
            selectHandler.getClampWidthLeft() ||
            selectHandler.getClampWidthRight()
        ) {
            newPosition.x = this.x;
        }

        if (
            selectHandler.getClampHeightTop() ||
            selectHandler.getClampHeightBottom()
        ) {
            newPosition.y = this.y;
        }
    }

    public getKind(): string {
        return this.constructor.name;
    }

    public getAttributes(): Attributes {
        return {
            gridUid: this._grid.getUId(),
            width: this.displayedEntity?.width ?? this.width,
            height: this.displayedEntity?.height ?? this.height,
            position: {
                x: this.x,
                y: this.y,
            },
            isSnapping: this.isSnapping,
            isDraggable: this.isDraggable,
            isSelectable: this.isSelectable,
            isResizable: this.isResizable,
            eventMode: this.eventMode,
            cursor: this.cursor,
            rotation: this.rotation,
        } as Attributes;
    }

    public applyUpdateAction(changes: TypedJson<Attributes>): void {
        this._uid = changes.uid;
        if (this.displayedEntity) {
            this.displayedEntity.width = changes.width;
            this.displayedEntity.height = changes.height;
        } else {
            this.width = changes.width;
            this.height = changes.height;
        }
        this.position.x = changes.position.x;
        this.position.y = changes.position.y;
        this.isSnapping = changes.isSnapping ?? DEFAULTS.isSnapping;
        this.isDraggable = changes.isDraggable ?? DEFAULTS.isDraggable;
        this.isSelectable = changes.isSelectable ?? DEFAULTS.isSelectable;
        this.isResizable = changes.isResizable ?? DEFAULTS.isResizable;
        this.eventMode = changes.eventMode;
        this.cursor = changes.cursor;
        if (changes.rotation !== undefined) {
            this.rotation = changes.rotation;
        }
    }

    public getUId(): UId {
        return this._uid;
    }

    public setUId(uid: UId) {
        this._uid = uid;
    }

    public toJSON(): TypedJson<Attributes> {
        return {
            ...this.getAttributes(),
            kind: this.getKind(),
            uid: this.getUId(),
            timestamp: Date.now(),
        };
    }

    public static getKindStatic(): string {
        return this.name;
    }

    public deleteAction(action: DeleteAction): void {
        action.acc.push(this);

        action.cleanupCallbacks.push(() => {
            this.destroy(true);
        });
    }

    public get eventEmitter(): EventEmitter<ContainerEventTypes> {
        return this._eventEmitter;
    }

    public getLastChangesTimestamp(): Maybe<number> {
        return this._lastChangesTimestamp;
    }

    public shouldApplyChanges(changes: TypedJson<Attributes>): boolean {
        return shouldApplyChanges(this, changes);
    }
}
