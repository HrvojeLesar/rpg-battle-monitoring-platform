import { Graphics, GraphicsContext, GraphicsOptions, Point } from "pixi.js";
import { RpgToken } from "../tokens/rpg_token";
import { Scene } from "@/board_core/scene";
import { GridCell, GridCellPosition } from "@/board_core/grid/cell";

export type ArrowOptions = {
    token: RpgToken;
    scene: Scene;
} & (GraphicsOptions | GraphicsContext);

export class Arrow extends Graphics {
    protected _startPoint: Point;
    protected _from: Point;
    protected _to: Point;
    public token: RpgToken;
    public scene: Scene;

    constructor(options: ArrowOptions) {
        super(options);

        this.scene = options.scene;
        this.token = options.token;

        const startPoint = this.getAdjustedPoint(
            this.token.getGridCellPosition(),
        );

        this._startPoint = startPoint.clone();
        this._from = startPoint.clone();
        this._to = startPoint;
        this.drawArrow();
    }

    public getFrom(): Point {
        return this._from.clone();
    }

    public setFrom(value: Point) {
        this._from = value;

        this.drawArrow();
    }

    public getTo(): Point {
        return this._to;
    }

    public setTo(value: Point) {
        this._to = value.clone();

        this.drawArrow();
    }

    public get startPoint(): Point {
        return this._startPoint;
    }

    public getAdjustedPoint(cell: GridCellPosition | GridCell): Point {
        const cellSize = this.scene.grid.cellSize;
        return new Point(
            cell.x * cellSize + cellSize / 2,
            cell.y * cellSize + cellSize / 2,
        );
    }

    protected drawArrow(): void {
        this.clear();

        this.moveTo(this._from.x, this._from.y)
            .lineTo(this._to.x, this._to.y)
            .stroke({ color: "red", width: 5 });

        this.drawArrowCircle(this._from);
        this.drawArrowCircle(this._to);
    }

    protected drawArrowCircle(point: Point): void {
        this.circle(point.x, point.y, 5)
            .stroke({ color: "red", width: 2 })
            .circle(point.x, point.y, 5)
            .fill({ color: "green" });
    }
}
