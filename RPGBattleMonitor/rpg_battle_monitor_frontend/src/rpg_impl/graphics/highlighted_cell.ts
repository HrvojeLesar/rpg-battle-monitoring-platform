import { Graphics } from "pixi.js";
import { GridCellPosition } from "@/board_core/grid/cell";
import { RpgToken } from "../tokens/rpg_token";
import { Grid } from "@/board_core/grid/grid";
import { sizeToGridCellMultiplier } from "../characters_stats/combat";

export class HighlightedCell extends Graphics {
    protected _gridCellPosition: GridCellPosition;
    protected _token: RpgToken;

    constructor(
        gridCellPosition: GridCellPosition,
        grid: Grid,
        token: RpgToken,
    ) {
        super();

        this._gridCellPosition = gridCellPosition;

        this._token = token;

        this.position.set(
            gridCellPosition.x * grid.cellSize,
            gridCellPosition.y * grid.cellSize,
        );

        const multiplier = sizeToGridCellMultiplier(token.tokenData.size);
        this.rect(
            0,
            0,
            grid.cellSize * multiplier,
            grid.cellSize * multiplier,
        ).fill({
            color: "green",
            alpha: 0.5,
        });
    }

    public get gridCellPosition(): GridCellPosition {
        return this._gridCellPosition;
    }

    public get token(): RpgToken {
        return this._token;
    }
}
