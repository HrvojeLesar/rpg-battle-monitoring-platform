import { GridCell, GridCellPosition } from "../grid/cell";

export interface IGridMove {
    getGridCellPosition(): GridCell;
    moveToGridCell(position: GridCellPosition): void;
}
