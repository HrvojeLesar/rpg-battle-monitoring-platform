import { Container, Graphics, Point, Sprite, Texture } from "pixi.js";
import {
    DeleteAction,
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "../interfaces/messagable";
import newUId from "../utils/uuid_generator";
import { GAtomStore } from "../../board_react_wrapper/stores/state_store";
import { Position } from "@/types/position";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { GridCell } from "./cell";
import { WORLD_SIZE } from "../scene";

export type GridOptions = {
    hover?: boolean;
    cellSize?: number;
    gridSize?: GridSize;
    opacity: number;
};

export type GridSize = {
    width: number;
    height: number;
};

export type GridAttributes = {
    _cellSize: number;
    _size: GridSize;
    hover: boolean;
    position: Position;
    opacity: number;
};

export class Grid extends Container implements IMessagable<GridAttributes> {
    protected gridSprite: Container;
    protected hoveredCell: Graphics;
    public hover: boolean = true;
    protected _lastChangesTimestamp: Maybe<number> = undefined;
    protected _opacity: number;

    protected _cellSize: number = 200;
    protected _size: GridSize = {
        width: 6000,
        height: 6000,
    };

    private _uid: UId;

    constructor(options?: GridOptions) {
        super();

        this._uid = newUId();
        this.hover = options?.hover ?? this.hover;
        this._cellSize = options?.cellSize ?? this._cellSize;
        this._size = options?.gridSize ?? this._size;
        this._opacity = options?.opacity ?? 1;
        this.alpha = this._opacity;

        this.gridSprite = new DrawnGrid(this._cellSize, this._size);
        this.interactive = true;

        this.hoveredCell = this.createHoveredCell();

        this.initEvents();

        this.addChild(this.gridSprite);
    }

    public get cellSize(): number {
        return this._cellSize;
    }

    public set cellSize(cellSize: number) {
        this._cellSize = cellSize;
        this.fixPosition();
        this.replaceGrid();
    }

    public get size(): GridSize {
        return this._size;
    }

    public set size(size: GridSize) {
        this._size = size;
        this.replaceGrid();
    }

    public fixPosition(): void {
        const x = WORLD_SIZE / 2 - this.width / 2;
        const y = WORLD_SIZE / 2 - this.height / 2;
        const startCell = GridCell.getGridCellFromPoint(new Point(x, y), this);

        this.position.set(
            startCell.x * this._cellSize,
            startCell.y * this._cellSize,
        );
    }

    private replaceGrid(): void {
        this.removeChild(this.gridSprite);
        this.gridSprite = new DrawnGrid(this._cellSize, this._size);
        this.addChild(this.gridSprite);

        this.removeChild(this.hoveredCell);
        this.hoveredCell = this.createHoveredCell();
    }

    protected initEvents() {
        this.onpointermove = (event) => {
            const localPosition = event.getLocalPosition(this);
            const cellPosition = this.getCellCoordinates(localPosition);

            if (this.hover) {
                this.hoveredCell.x = cellPosition.x * this._cellSize;
                this.hoveredCell.y = cellPosition.y * this._cellSize;
                this.resizeHoveredCell();
            }
        };

        this.onpointerenter = () => {
            if (this.hover) {
                this.hoveredCell.visible = true;
            }
        };

        this.onpointerleave = () => {
            if (this.hover) {
                this.hoveredCell.visible = false;
            }
        };
    }

    private getCellCoordinates(point: Point): Point {
        return new Point(
            Math.floor(point.x / this._cellSize),
            Math.floor(point.y / this._cellSize),
        );
    }

    private createHoveredCell(): Graphics {
        const hoveredCell = new Graphics({ label: "Hovered cell" });
        hoveredCell
            .rect(0, 0, this._cellSize, this._cellSize)
            .fill({ color: "red" });
        hoveredCell.visible = false;

        this.addChild(hoveredCell);

        return hoveredCell;
    }

    private resizeHoveredCell(): void {
        if (this.hoveredCell.x + this._cellSize > this._size.width) {
            this.hoveredCell.width = this._size.width - this.hoveredCell.x;
        } else {
            this.hoveredCell.width = this._cellSize;
        }

        if (this.hoveredCell.y + this._cellSize > this._size.height) {
            this.hoveredCell.height = this._size.height - this.hoveredCell.y;
        } else {
            this.hoveredCell.height = this._cellSize;
        }
    }

    public getKind(): string {
        return this.constructor.name;
    }

    public getUId(): UId {
        return this._uid;
    }

    public setUId(uid: UId): void {
        this._uid = uid;
    }

    public toJSON(): TypedJson<GridAttributes> {
        return {
            ...this.getAttributes(),
            kind: this.getKind(),
            uid: this.getUId(),
            timestamp: Date.now(),
        };
    }

    public getAttributes(): GridAttributes {
        return {
            _cellSize: this.cellSize,
            _size: this.size,
            hover: this.hover,
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            opacity: this.opacity,
        };
    }

    public applyUpdateAction(changes: TypedJson<GridAttributes>): void {
        this._uid = changes.uid;
        this.cellSize = changes._cellSize;
        this.size = changes._size;
        this.hover = changes.hover;
        this.position.x = changes.position.x;
        this.position.y = changes.position.y;
        this.opacity = changes.opacity;

        GAtomStore.set(sceneAtoms.refreshScenes);
    }

    public deleteAction(action: DeleteAction): void {
        action.acc.push(this);

        action.cleanupCallbacks.push(() => {
            this.destroy(true);
        });
    }

    public static getKindStatic(): string {
        return this.name;
    }

    public getLastChangesTimestamp(): Maybe<number> {
        return this._lastChangesTimestamp;
    }

    public shouldApplyChanges(changes: TypedJson<GridAttributes>): boolean {
        return shouldApplyChanges(this, changes);
    }

    public get opacity(): number {
        return this._opacity;
    }

    public set opacity(opacity: number) {
        this._opacity = opacity;
        this.alpha = opacity;
    }
}

class DrawnGrid extends Container {
    private cellSize: number;
    private gridSize: GridSize;

    constructor(cellSize: number, gridSize: GridSize) {
        super();

        this.cellSize = cellSize;
        this.gridSize = gridSize;

        const background = new Sprite(Texture.EMPTY);
        background.width = this.gridSize.width;
        background.height = this.gridSize.height;

        const gridGraphics = new Graphics();

        // Draw vertical lines
        const repeatVertical = this.gridSize.width / this.cellSize;
        for (let i = 0; i < repeatVertical; i++) {
            gridGraphics
                .moveTo(i * this.cellSize, 0)
                .lineTo(i * this.cellSize, this.gridSize.height);
        }

        // Draw horizontal lines
        const repeatHorizontal = this.gridSize.height / this.cellSize;
        for (let i = 0; i < repeatHorizontal; i++) {
            gridGraphics
                .moveTo(0, i * this.cellSize)
                .lineTo(this.gridSize.width, i * this.cellSize);
        }
        gridGraphics.stroke({ color: 0xffffff, pixelLine: true, width: 1 });

        // Outline
        gridGraphics
            .rect(0, 0, this.gridSize.width, this.gridSize.height)
            .stroke({ color: 0xffffff, pixelLine: true, width: 1 });

        this.addChild(background, gridGraphics);
    }
}
