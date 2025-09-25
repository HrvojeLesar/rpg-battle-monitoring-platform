import { Point } from "pixi.js";

export type Callbacks = {
    start?: () => void;
    onPoint?: (point: Point) => void;
    end?: () => void;
};

// TODO: credit https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
// TODO: credit https://playtechs.blogspot.com/2007/03/raytracing-on-grid.html
export function raycast(
    startPoint: Point,
    endPoint: Point,
    callbacks: Callbacks = {},
): void {
    callbacks.start?.();

    const derivedPoint = new Point(
        Math.abs(endPoint.x - startPoint.x),
        Math.abs(endPoint.y - startPoint.y),
    );
    const point = new Point(startPoint.x, startPoint.y);

    // WARN: this checks every pixel and can be quite inefficient because most of the time the same cell is tested
    let numberOfPointsOnScreen = 1 + derivedPoint.x + derivedPoint.y;

    const increment = new Point(
        endPoint.x > startPoint.x ? 1 : -1,
        endPoint.y > startPoint.y ? 1 : -1,
    );
    let error = derivedPoint.y - derivedPoint.y;

    derivedPoint.x *= 2;
    derivedPoint.y *= 2;

    for (; numberOfPointsOnScreen > 0; --numberOfPointsOnScreen) {
        callbacks.onPoint?.(point);
        if (error > 0) {
            point.x += increment.x;
            error -= derivedPoint.y;
        } else {
            point.y += increment.y;
            error += derivedPoint.x;
        }
    }

    callbacks.end?.();
}
