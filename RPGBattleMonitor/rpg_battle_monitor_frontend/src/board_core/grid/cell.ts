import { Point } from "pixi.js";
import { ContainerExtension } from "../extensions/container_extension";
import { Grid } from "./grid";
import { IGridMove } from "../interfaces/grid_move";
import { GBoard } from "../board";

export class GridCellPosition extends Point {}

export class GridCell extends Point implements IGridMove {
    private container: ContainerExtension;
    private grid: Grid;

    public constructor(container: ContainerExtension) {
        super();

        this.container = container;
        this.grid = container.grid;

        this.calculateCellPosition();
    }

    private getCellPosition(): GridCell {
        this.calculateCellPosition();

        return this;
    }

    private setCellPosition(position: GridCellPosition): void {
        this.set(position.x, position.y);

        this.container.position.set(
            this.x * this.grid.cellSize,
            this.y * this.grid.cellSize,
        );
    }

    // WARN: check if this actually works for any cell size and is not off by one
    private calculateCellPosition() {
        this.set(
            Math.round(this.container.x / this.grid.cellSize),
            Math.round(this.container.y / this.grid.cellSize),
        );
    }

    public getGridCellPosition(): GridCell {
        return this.getCellPosition();
    }

    public moveToGridCell(position: GridCellPosition): void {
        this.setCellPosition(position);
    }

    public static getGridCellFromPoint(
        point: Point,
        grid?: Grid,
    ): GridCellPosition {
        if (grid === undefined) {
            grid = GBoard.scene?.grid;
        }

        if (grid === undefined) {
            return new Point(0, 0);
        }

        return new Point(
            Math.floor(point.x / grid.cellSize),
            Math.floor(point.y / grid.cellSize),
        );
    }
}
