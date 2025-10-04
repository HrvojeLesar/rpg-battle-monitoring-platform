import { Point } from "pixi.js";
import { RpgScene } from "../scene/scene";
import { RpgToken } from "../tokens/rpg_token";

export class OccupiedSpaceHandler {
    public scene: RpgScene;

    public constructor(scene: RpgScene) {
        this.scene = scene;
    }

    public isSpaceOccupied(token: RpgToken): boolean {
        const tokens = this.scene.rpgTokens.filter((t) => t !== token);
        const cell = token.getGridCellPosition();
        const destinationCells = token.getOccupiedCells(
            new Point(
                cell.x * this.scene.grid.cellSize,
                cell.y * this.scene.grid.cellSize,
            ),
        );

        for (const cell of destinationCells) {
            if (
                tokens.find((t) =>
                    t.getOccupiedCells().find((c) => c.equals(cell)),
                )
            ) {
                return true;
            }
        }

        return false;
    }
}
