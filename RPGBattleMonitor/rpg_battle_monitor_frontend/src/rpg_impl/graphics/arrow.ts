import {
    Container,
    Graphics,
    GraphicsContext,
    GraphicsOptions,
    Point,
} from "pixi.js";

export type ArrowOptions = {
    from: Point;
    to: Point;
    forContainer: Maybe<Container>;
} & (GraphicsOptions | GraphicsContext);

export class Arrow extends Graphics {
    protected _from: Point;
    protected _to: Point;
    public forContainer: Maybe<Container> = undefined;

    constructor(options: ArrowOptions) {
        super(options);

        this._from = options.from;
        this._to = options.to;
        this.drawArrow();

        this.forContainer = options.forContainer;
    }

    public getFrom(): Point {
        return this._from;
    }

    public setFrom(value: Point) {
        this._from = value;

        this.drawArrow();
    }

    public getTo(): Point {
        return this._to;
    }

    public setTo(value: Point) {
        this._to = value;

        this.drawArrow();
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
