import {
    Application,
    Container,
    Graphics,
    Point,
    Sprite,
    Texture,
} from "pixi.js";
import {
    GridEventEmitter,
    ReactPixiJsBridgeEventEmitter,
} from "../types/event_emitter";

type GridOptions = {
    hover?: boolean;
    cellSize?: number;
    gridSize?: GridSize;
};

export type GridSize = {
    width: number;
    height: number;
};

export class Grid extends Container /* implements IModelConfiguration */ {
    protected app: Application;
    protected gridSprite: Container;
    protected hoveredCell: Graphics;
    protected hover: boolean = true;
    protected eventEmitter: GridEventEmitter;

    protected _cellSize: number = 100;
    protected _size: GridSize = {
        width: 3000,
        height: 1000,
    };

    constructor(
        app: Application,
        eventEmitter: ReactPixiJsBridgeEventEmitter | GridEventEmitter,
        options?: GridOptions,
    ) {
        super();

        this.hover = options?.hover ?? this.hover;
        this._cellSize = options?.cellSize ?? this._cellSize;
        this._size = options?.gridSize ?? this._size;

        this.eventEmitter = eventEmitter;

        this.app = app;
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
        this.replaceGrid();
    }

    public get size(): GridSize {
        return this._size;
    }

    public set size(size: GridSize) {
        this._size = size;
        this.replaceGrid();
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

        this.onpointerenter = (_event) => {
            if (this.hover) {
                this.hoveredCell.visible = true;
            }
        };

        this.onpointerleave = (_event) => {
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
        const hoveredCell = new Graphics();
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
