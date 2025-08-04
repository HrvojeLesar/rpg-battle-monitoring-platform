import { Point, PointData } from "pixi.js";

declare module "pixi.js" {
    export interface Point {
        distance(other: PointData): number;
    }
}

const pointMixin: any = {
    distance(other: PointData): number {
        return Math.sqrt(
            Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2),
        );
    },
};

Object.assign(Point.prototype, pointMixin);
