import { Container } from "pixi.js";
import { createGhost } from "../utils/container_ghost";
import { Grid } from "../grid";
import { addItem, removeItem } from "../utils/unique_collection_interface";
import { ReactPixiJsBridgeEventEmitter } from "../../types/event_emitter";

declare module "pixi.js" {
    export interface Container {
        // isSnapping: boolean;
        // snapToGrid(grid: Grid, force?: boolean): void;
        ghosts: Container[];
        createGhost(): Container;
        popGost(): Option<Container>;
        removeGhost(ghost: Container): Option<Container>;
        removeGhosts(): void;
        bridgeEventEmitter?: ReactPixiJsBridgeEventEmitter;
        setBridgeEventEmitter(
            eventEmitter: ReactPixiJsBridgeEventEmitter,
        ): void;
        getBridgeEventEmitter(): ReactPixiJsBridgeEventEmitter;
        id: number | null;
    }
}

Container.prototype.isSnapping = false;
Container.prototype.snapToGrid = function (
    this: Container,
    grid: Grid,
    force: boolean = false,
) {
    if (this.isSnapping === false && force === false) {
        return;
    }

    this.position.x =
        Math.round(this.position.x / grid.cellSize) * grid.cellSize;
    this.position.y =
        Math.round(this.position.y / grid.cellSize) * grid.cellSize;
};

// TODO: Maybe instead of recreating ghost element every time
// only hide ghost element and reuse it later
Container.prototype.ghosts = [];
Container.prototype.createGhost = function (this: Container): Container {
    const ghost = createGhost(this);

    addItem(this.ghosts, ghost);

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
    return removeItem(this.ghosts, ghost);
};

Container.prototype.removeGhosts = function (this: Container): void {
    this.ghosts.forEach((element) => {
        this.parent.removeChild(element);
    });

    this.ghosts = [];
};

Container.prototype.bridgeEventEmitter = undefined;

Container.prototype.setBridgeEventEmitter = function (
    this: Container,
    eventEmitter: ReactPixiJsBridgeEventEmitter,
): void {
    this.bridgeEventEmitter = eventEmitter;
};

Container.prototype.getBridgeEventEmitter = function (
    this: Container,
): ReactPixiJsBridgeEventEmitter {
    if (this.bridgeEventEmitter === undefined) {
        throw new Error(
            "This function can only be used after setting the bridge event emitter",
        );
    }

    return this.bridgeEventEmitter;
};

Container.prototype.id = null;
