import { Point } from "pixi.js";
import { ContainerExtension } from "../extensions/container_extension";
import { Grid } from "./grid";
import { IGridMove } from "../interfaces/grid_move";

export type GridCellPosition = Point;

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

    private calculateCellPosition() {
        this.set(
            Math.floor(this.container.x / this.grid.cellSize),
            Math.floor(this.container.y / this.grid.cellSize),
        );
    }

    public getGridCellPosition(): GridCell {
        return this.getCellPosition();
    }

    public moveToGridCell(position: GridCellPosition): void {
        this.setCellPosition(position);
    }
}
