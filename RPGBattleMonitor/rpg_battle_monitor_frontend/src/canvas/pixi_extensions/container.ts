import { Container } from "pixi.js";
import { createGhost } from "../utils/container_ghost";
import { GRID_PIXELS } from "../init";

declare module "pixi.js" {
    export interface Container {
        canSnapToGrid: boolean;
        snapToGrid(): void;
        ghosts: Container[];
        createGhost(): Container;
        popGost(): Container | undefined | null;
        removeGhost(ghost: Container): Container | undefined | null;
        removeGhosts(): void;
    }
}

Container.prototype.canSnapToGrid = false;
Container.prototype.snapToGrid = function (this: Container) {
    if (this.canSnapToGrid !== true) {
        return;
    }

    // TODO: get grid configuration and actual grid size
    this.position.x = Math.round(this.position.x / GRID_PIXELS) * GRID_PIXELS;
    this.position.y = Math.round(this.position.y / GRID_PIXELS) * GRID_PIXELS;
};

Container.prototype.ghosts = [];
Container.prototype.createGhost = function (this: Container): Container {
    const ghost = createGhost(this);

    this.ghosts.push(ghost);

    this.parent.addChildAt(ghost, this.parent.getChildIndex(this));

    return ghost;
};

Container.prototype.popGost = function (
    this: Container,
): Container | undefined | null {
    const ghost = this.ghosts.pop();

    if (ghost) {
        this.parent.removeChild(ghost);
    }

    return ghost;
};

Container.prototype.removeGhost = function (
    this: Container,
    ghost: Container,
): Container | undefined | null {
    const index = this.ghosts.indexOf(ghost);
    if (index > -1) {
        return null;
    }

    this.ghosts.splice(index, 1);

    if (ghost) {
        this.parent.removeChild(ghost);
    }

    return ghost;
};

Container.prototype.removeGhosts = function (this: Container): void {
    this.ghosts.forEach((element) => {
        this.parent.removeChild(element);
    });
};
