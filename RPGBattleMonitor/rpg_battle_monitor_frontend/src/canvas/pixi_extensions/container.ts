import { Container } from "pixi.js";
import { createGhost } from "../utils/container_ghost";
import { Grid } from "../grid";

declare module "pixi.js" {
    export interface Container {
        canSnapToGrid: boolean;
        snapToGrid(grid: Grid, force?: boolean): void;
        ghosts: Container[];
        createGhost(): Container;
        popGost(): Option<Container>;
        removeGhost(ghost: Container): Option<Container>;
        removeGhosts(): void;
    }
}

Container.prototype.canSnapToGrid = false;
Container.prototype.snapToGrid = function (
    this: Container,
    grid: Grid,
    force: boolean = false,
) {
    if (this.canSnapToGrid === false && force === false) {
        return;
    }

    this.position.x =
        Math.round(this.position.x / grid.cellSize) * grid.cellSize;
    this.position.y =
        Math.round(this.position.y / grid.cellSize) * grid.cellSize;
};

Container.prototype.ghosts = [];
Container.prototype.createGhost = function (this: Container): Container {
    const ghost = createGhost(this);

    this.ghosts.push(ghost);

    this.parent.addChildAt(ghost, this.parent.getChildIndex(this));

    return ghost;
};

Container.prototype.popGost = function (this: Container): Option<Container> {
    const ghost = this.ghosts.pop();

    if (ghost) {
        this.parent.removeChild(ghost);
    }

    return ghost;
};

Container.prototype.removeGhost = function (
    this: Container,
    ghost: Container,
): Option<Container> {
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
