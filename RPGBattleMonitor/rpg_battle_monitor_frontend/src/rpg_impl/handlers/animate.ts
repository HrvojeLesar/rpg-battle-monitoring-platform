import { Point } from "pixi.js";
import { RpgToken } from "../tokens/rpg_token";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { Arrow } from "../graphics/arrow";
import { GridCell } from "@/board_core/grid/cell";
import { GBoard } from "@/board_core/board";
import { raycast } from "../utils/raycast";
import { HighlightedCell } from "../graphics/highlighted_cell";
import { Scene } from "@/board_core/scene";
import { shortestPath } from "../utils/highlighted_cells_shortest_path";

// TODO: Make better, currently breaks easily
// TODO: Process multiple movements in "parallel"
export class RpgTokenAnimator {
    protected animateMoveQueue: (() => void)[] = [];

    public constructor() {}

    protected _animateMove(token: RpgToken, endPoint: Point) {
        const currentScene = GAtomStore.get(sceneAtoms.getCurrentScene);
        if (currentScene === undefined || currentScene !== token.scene) {
            token.position.set(endPoint.x, endPoint.y);
            const next = this.animateMoveQueue.shift();
            next?.();

            return;
        }

        const arrow = new Arrow({
            token,
            scene: currentScene,
            visible: true,
        });
        const to = arrow.getAdjustedPoint(
            GridCell.getGridCellFromPoint(endPoint),
        );
        arrow.setTo(to);

        const cellPoints: HighlightedCell[] = [];
        raycast(arrow.getFrom(), arrow.getTo(), {
            onPoint: (point) => {
                const cellPoint = this.highlightCell(
                    point,
                    token,
                    currentScene,
                );
                if (cellPoint !== undefined) {
                    cellPoints.push(cellPoint);
                }
            },
        });
        const shortestPathCells = shortestPath(cellPoints);

        // TODO: sometimes incorrect or not shown
        for (const cellPoint of shortestPathCells) {
            cellPoint.visible = true;
        }

        currentScene.layers.getLayer("animate").container.addChild(arrow);

        const cleanup = () => {
            for (const cellPoint of cellPoints) {
                cellPoint.destroy(true);
            }
            arrow.destroy(true);

            const next = this.animateMoveQueue.shift();
            next?.();
        };

        const speed = 0.05;

        const tick = () => {
            const nextX = token.x + (endPoint.x - token.x) * speed;
            const nextY = token.y + (endPoint.y - token.y) * speed;
            token.position.set(nextX, nextY);

            if (
                token.position.x + 10 >= endPoint.x &&
                token.position.x - 10 <= endPoint.x &&
                token.position.y + 10 >= endPoint.y &&
                token.position.y - 10 <= endPoint.y
            ) {
                token.position.set(endPoint.x, endPoint.y);
                cleanup();
                GBoard.app.ticker.remove(tick);
            }
        };

        GBoard.app.ticker.add(tick);
    }

    public animateMove(token: RpgToken, endPoint: Point) {
        this.animateMoveQueue.push(() => {
            this._animateMove(token, endPoint);
        });

        if (this.animateMoveQueue.length === 1) {
            this.animateMoveQueue[0]();
        }
    }

    protected highlightCell(
        point: Point,
        token: RpgToken,
        scene: Scene,
    ): Maybe<HighlightedCell> {
        const cell = GridCell.getGridCellFromPoint(point, scene.grid);

        const existingHighlight = scene.layers
            .getLayer("animate")
            .container.children.find(
                (child) =>
                    child instanceof HighlightedCell &&
                    child.gridCellPosition.x === cell.x &&
                    child.gridCellPosition.y === cell.y &&
                    child.token === token,
            );

        if (existingHighlight === undefined) {
            const highlightCell = new HighlightedCell(cell, scene.grid, token);
            scene.layers.getLayer("animate").container.addChild(highlightCell);
            highlightCell.visible = false;

            return highlightCell;
        }

        return undefined;
    }
}
