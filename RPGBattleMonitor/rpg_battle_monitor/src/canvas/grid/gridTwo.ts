import * as PIXI from "pixi.js";

/**
 * @author: Luis Angel Garcia
 */
/** */
const DEFAULT_LINE_STYLE = {
    width: 1,
    color: "white",
    alpha: 1,
    alignment: 0.5,
};

/**
 * @description Utility class that draws a grid on the screen.
 * @extends PIXI.Graphics
 */
export class PixiJSGrid extends PIXI.Graphics {
    /**
     * @param {number} cellSize number. Optional. default: the square root of the grid's side length
     */
    set cellSize(cellSize = null) {
        this._cellSize = cellSize || Math.sqrt(this._correctedWidth);
    }

    get cellSize() {
        return this._cellSize;
    }

    /**
     * The amount of equally spaced lines along the grid's side.
     */
    get amtLines() {
        return Math.floor(this.gridWidth / this.cellSize);
    }

    /**
     * The coordinates for each corner of the grid.
     * The leftmost (**x1**), topmost (**y1**), rightmost (**x2**), and bottommost (**y2**) coordinates.
     */
    get bounds() {
        return {
            x1: this.x,
            y1: this.y,
            x2: this.x + this._correctedWidth,
            y2: this.y + this._correctedWidth,
        };
    }

    set drawBoundaries(drawBoundaries) {
        this._drawBoundaries = drawBoundaries;
    }

    get drawBoundaries() {
        return this._drawBoundaries;
    }

    /**
     * The requested width of the grid given by the `width` constructor parameter.
     */
    get originalWidth() {
        return this._gridWidth;
    }

    /**
     * The corrected width of the grid, which is the smallest square root number larger than
     * the corrected width.
     */
    get correctedWidth() {
        return this._correctedWidth;
    }

    get useCorrectedWidth() {
        return this._useCorrectedWidth;
    }

    /**
     * The coordinates for each corner of the grid.
     * @returns {{ x1: number, y1: number, x2: number, y2: number}}
     * The leftmost (**x1**), topmost (**y1**), rightmost (**x2**), and bottommost (**y2**) coordinates.
     */
    get bounds() {
        return {
            x1: this.x,
            y1: this.y,
            x2: this.x + this._correctedWidth,
            y2: this.y + this._correctedWidth,
        };
    }

    set drawBoundaries(drawBoundaries) {
        this._drawBoundaries = drawBoundaries;
    }

    get drawBoundaries() {
        return this._drawBoundaries;
    }

    /**
     * The actual width of the grid.
     * When the `cellSize` is not the default, the width of the grid will be the
     * width given in the `width` constructor. Otherwise, it is the corrected width.
     */
    get gridWidth() {
        if (!this.useCorrectedWidth) {
            return this._gridWidth;
        }
        return Math.abs(this.cellSize - Math.sqrt(this._correctedWidth)) <= 1e-6
            ? this._correctedWidth
            : this._gridWidth;
    }

    constructor(
        width: number,
        cellSize: number | null = null,
        lineConfig: Partial<PIXI.StrokeInput> | null = null,
        useCorrectedWidth: boolean = true,
        drawBoundaries: boolean = true,
    ) {
        super();

        this._cellSize = null;
        this._amtLines = null;

        this._gridWidth = width;
        this._useCorrectedWidth = useCorrectedWidth;
        this._correctedWidth = null;
        this._correctWidth();

        this._drawBoundaries = drawBoundaries;

        this.cellSize = cellSize;

        const lConfig = { ...DEFAULT_LINE_STYLE, ...(lineConfig || {}) };
        this.setStrokeStyle(lConfig);

        // handle mouse move
        this.interactive = true;
        this.on("mousemove", (evt) => {
            const mouseCoords = evt.data.global;
            // check if the mouse is within the bounds of this grid. If not, do nothing.
            if (
                mouseCoords.x >= this.bounds.x1 &&
                mouseCoords.x <= this.bounds.x2 &&
                mouseCoords.y >= this.bounds.y1 &&
                mouseCoords.y <= this.bounds.y2
            ) {
                const gridCoords = this.getCellCoordinates(
                    mouseCoords.x,
                    mouseCoords.y,
                );
                this.onMousemove(evt, gridCoords);
            }
        });
    }

    /**
     * Draws the grid to the containing PIXI stage
     */
    drawGrid() {
        this.clearGrid(true);
        for (
            let i = this._drawBoundaries ? 0 : 1;
            i <= this.amtLines - (this._drawBoundaries ? 0 : 1);
            i += 1
        ) {
            const startCoord = i * this._cellSize;

            // draw the column
            this.moveTo(startCoord, 0);
            this.lineTo(startCoord, this._correctedWidth);

            // draw the row
            this.moveTo(0, startCoord);
            this.lineTo(this._correctedWidth, startCoord);
        }
        this.fill(0x808080);
        this.stroke();

        return this;
    }

    clearGrid(retainLineStyle = true): this {
        const { width, alignment, color, alpha } = this.strokeStyle;
        this.clear();

        if (!retainLineStyle) {
            return this;
        }

        this.setStrokeStyle({ width, color, alpha, alignment });

        return this;
    }

    getCellCoordinates(x: number, y: number) {
        return {
            x: Math.floor((x - this.bounds.x1) / this.cellSize),
            y: Math.floor((y - this.bounds.y1) / this.cellSize),
        };
    }

    /**
     * Callback fired after detecting a mousemove event.
     *
     * @param {PIXI.InteractionData} evt
     * The `PIXI.InteractionData` captured by the event.
     *
     * @param {{x: number, y: number}} gridCoords
     * The grid-level coordinates captured by the event.
     */
    onMousemove(evt, gridCoords) {
        console.log("move move move");
    }

    /**
     * Calculates the corrected width. If the `useCorrectedWidth` constructor parameter is set to **false**,
     * then it simply keeps the given value for `width` as the corrected width.
     */
    _correctWidth() {
        if (!this._useCorrectedWidth) {
            this._correctedWidth = this._gridWidth;
        }

        this._correctedWidth = Math.ceil(Math.sqrt(this._gridWidth)) ** 2;
    }
}
