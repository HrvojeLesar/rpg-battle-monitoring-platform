import { Bounds } from "pixi.js";

declare module "pixi.js" {
    export interface Bounds {
        intersects(other: Bounds): boolean;
    }
}

Bounds.prototype.intersects = function (other: Bounds): boolean {
    return (
        this.x < other.x + other.width &&
        this.x + this.width > other.x &&
        this.y < other.y + other.height &&
        this.y + this.height > other.y
    );
};
