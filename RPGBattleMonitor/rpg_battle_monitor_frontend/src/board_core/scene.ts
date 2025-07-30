import { Viewport } from "pixi-viewport";
import { Grid } from "./grid";
import { GBoard } from "./board";

export class Scene {
    public readonly name: string;
    protected viewport: Viewport;
    protected grid: Grid;

    public constructor(name: string) {
        this.name = name;
        this.grid = new Grid();

        const gridSize = this.grid.size;

        function getWorldSize() {
            return Math.round(
                // TODO: make sure grid is in the center of viewport and create viewport 4 times larger than grid
                // Math.max(gridSize.width, gridSize.height, Viewport.WORLD_SIZE),
                Math.max(gridSize.width, gridSize.height),
            );
        }

        const worldSize = getWorldSize();
        const app = GBoard.getApplication();

        this.viewport = new Viewport({
            events: app.renderer.events,
            screenWidth: app.canvas.width,
            screenHeight: app.canvas.height,
            worldWidth: worldSize,
            worldHeight: worldSize,
            allowPreserveDragOutside: true,
        });

        this.viewport.drag().pinch().wheel().clamp({
            left: true,
            right: true,
            top: true,
            bottom: true,
            direction: "all",
            underflow: "center",
        });

        this.viewport.addChild(this.grid);
        this.viewport.pause = true;
    }

    public setActive(): void {
        this.viewport.pause = false;
        GBoard.app.stage.addChild(this.viewport);
    }

    public cleanup(): void {
        this.viewport.pause = true;
        GBoard.app.stage.removeChild(this.viewport);
    }
}
