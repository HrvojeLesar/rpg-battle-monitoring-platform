import {
    Application,
    Container,
    Graphics,
    Point,
    Sprite,
    Texture,
} from "pixi.js";
import { GRID_PIXELS, GRID_SIZE } from "./init";

export class Grid extends Container {
    protected app: Application;

    protected gridSprite: Container;

    protected hoveredCell: Graphics | undefined;

    private hover: boolean = true;

    constructor(app: Application, options?: { hover?: boolean }) {
        super();

        this.hover = options?.hover ?? this.hover;

        this.app = app;
        this.gridSprite = new DrawnGrid();
        this.interactive = true;

        this.hoveredCell = this.initHoveredCell();

        this.initEvents();

        this.addChild(this.gridSprite);
        if (this.hoveredCell) {
            this.addChild(this.hoveredCell);
        }
    }

    protected initEvents() {
        this.onpointermove = (event) => {
            const localPosition = event.getLocalPosition(this);
            const cellPosition = this.getCellCoordinates(localPosition);

            if (this.hoveredCell) {
                this.hoveredCell.x = cellPosition.x * GRID_PIXELS;
                this.hoveredCell.y = cellPosition.y * GRID_PIXELS;
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
            Math.floor(point.x / GRID_PIXELS),
            Math.floor(point.y / GRID_PIXELS),
        );
    }

    private initHoveredCell() {
        if (!this.hover) {
            return undefined;
        }

        this.hoveredCell = new Graphics();
        this.hoveredCell
            .rect(0, 0, GRID_PIXELS, GRID_PIXELS)
            .fill({ color: "red" });
        this.hoveredCell.visible = false;

        return this.hoveredCell;
    }
}

class DrawnGrid extends Container {
    constructor() {
        super();

        const background = new Sprite(Texture.EMPTY);
        background.width = GRID_SIZE;
        background.height = GRID_SIZE;

        const gridGraphics = new Graphics();
        const repeat = GRID_SIZE / GRID_PIXELS;
        for (let i = 0; i < repeat; i++) {
            // Draw vertical lines
            gridGraphics
                .moveTo(i * GRID_PIXELS, 0)
                .lineTo(i * GRID_PIXELS, GRID_SIZE);

            // Draw horizontal lines
            gridGraphics
                .moveTo(0, i * GRID_PIXELS)
                .lineTo(GRID_SIZE, i * GRID_PIXELS);
        }

        gridGraphics.stroke({ color: 0xffffff, pixelLine: true, width: 1 });

        this.addChild(background, gridGraphics);
    }
}
