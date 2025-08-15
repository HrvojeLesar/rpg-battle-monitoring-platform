import { ContainerExtension } from "./extensions/container_extension";
import { Grid } from "./grid/grid";

export class Token {
    protected _container: ContainerExtension;
    protected _grid: Grid;

    public constructor(container: ContainerExtension, grid: Grid) {
        this._container = container;
        this._grid = grid;
    }

    public get container(): ContainerExtension {
        return this._container;
    }
}
