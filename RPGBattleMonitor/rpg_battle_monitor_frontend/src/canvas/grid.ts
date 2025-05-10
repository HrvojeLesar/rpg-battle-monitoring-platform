import {
    Application,
    Container,
    Graphics,
    Point,
    Sprite,
    Texture,
} from "pixi.js";

type GridOptions = {
    hover?: boolean;
    cellSize?: number;
    gridSize?: GridSize;
};

type GridSize = {
    width: number;
    height: number;
};

export class Grid extends Container {
    protected app: Application;
    protected gridSprite: Container;
    protected hoveredCell: Graphics | undefined;
    protected hover: boolean = true;

    protected _cellSize: number = 100;
    protected _size: GridSize = {
        width: 3000,
        height: 1000,
    };

    constructor(app: Application, options?: GridOptions) {
        super();

        this.hover = options?.hover ?? this.hover;
        this._cellSize = options?.cellSize ?? this._cellSize;
        this._size = options?.gridSize ?? this._size;

        this.app = app;
        this.gridSprite = new DrawnGrid(this._cellSize, this._size);
        this.interactive = true;

        this.hoveredCell = this.initHoveredCell();

        this.initEvents();

        this.addChild(this.gridSprite);
        if (this.hoveredCell) {
            this.addChild(this.hoveredCell);
        }
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
    }

    protected initEvents() {
        this.onpointermove = (event) => {
            const localPosition = event.getLocalPosition(this);
            const cellPosition = this.getCellCoordinates(localPosition);

            if (this.hoveredCell) {
                this.hoveredCell.x = cellPosition.x * this._cellSize;
                this.hoveredCell.y = cellPosition.y * this._cellSize;
            }
        };

        this.onpointerenter = (_event) => {
            if (this.hoveredCell) {
                this.hoveredCell.visible = true;
            }
        };

        this.onpointerleave = (_event) => {
            if (this.hoveredCell) {
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

    private initHoveredCell() {
        if (!this.hover) {
            return undefined;
        }

        this.hoveredCell = new Graphics();
        this.hoveredCell
            .rect(0, 0, this._cellSize, this._cellSize)
            .fill({ color: "red" });
        this.hoveredCell.visible = false;

        return this.hoveredCell;
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
        console.log(repeatVertical);
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

        this.addChild(background, gridGraphics);
    }
}
