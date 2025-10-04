import { GridCell } from "@/board_core/grid/cell";
import { RpgScene } from "../scene/scene";
import { RpgToken } from "../tokens/rpg_token";
import { raycast } from "../utils/raycast";
import { HighlightedCell } from "../graphics/highlighted_cell";
import { shortestPath } from "../utils/highlighted_cells_shortest_path";
import { Point } from "pixi.js";

export class InRangeHandler {
    public scene: RpgScene;

    public constructor(scene: RpgScene) {
        this.scene = scene;
    }

    public clearHighlight(): void {
        this.scene.rpgTokens.forEach((token) => {
            token.isHighlighted = false;
        });
    }

    // TODO: Does not work with larger tokens
    public highlightTokensInRange(from: RpgToken, range: number): void {
        this.clearHighlight();

        if (range < 0) {
            return;
        }

        const cellSize = this.scene.grid.cellSize;
        const fromPoints = from.getOccupiedCells().map((cell) => {
            return new Point(
                cell.x * cellSize + cellSize / 2,
                cell.y * cellSize + cellSize / 2,
            );
        });
        this.scene.rpgTokens
            .filter((token) => token !== from)
            .forEach((token) => {
                const occupiedCells = token.getOccupiedCells();
                for (const cell of occupiedCells) {
                    const cellCenterPoint = cell.getCenterPoint(cellSize);
                    for (const fromPoint of fromPoints) {
                        const cells: HighlightedCell[] = [];
                        raycast(fromPoint, cellCenterPoint, {
                            onPoint: (point) => {
                                const cell = GridCell.getGridCellFromPoint(
                                    point,
                                    this.scene.grid,
                                );

                                if (
                                    !cells.find(
                                        (c) =>
                                            c.gridCellPosition.x === cell.x &&
                                            c.gridCellPosition.y === cell.y,
                                    )
                                ) {
                                    cells.push(
                                        new HighlightedCell(
                                            cell,
                                            this.scene.grid,
                                            token,
                                        ),
                                    );
                                }
                            },
                        });

                        const pathWithStartingPointIncluded =
                            shortestPath(cells);
                        if (pathWithStartingPointIncluded.length - 1 <= range) {
                            token.isHighlighted = true;
                            return;
                        }
                    }
                }
            });
    }
}
