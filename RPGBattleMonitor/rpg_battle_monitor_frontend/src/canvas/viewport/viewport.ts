import { type IViewportOptions, Viewport as PixiViewport } from "pixi-viewport";
import { isDev } from "../../utils/dev_mode";
import { Application, Graphics } from "pixi.js";
import { Grid } from "../grid";

export class Viewport extends PixiViewport {
    public static readonly WORLD_SIZE = 6000;

    protected app: Application;
    protected grid: Grid;

    public static default(app: Application, grid: Grid): Viewport {
        const gridSize = grid.size;

        function getWorldSize() {
            return Math.round(
                // Math.max(gridSize.width, gridSize.height, Viewport.WORLD_SIZE),
                Math.max(gridSize.width, gridSize.height),
            );
        }

        const worldSize = getWorldSize();

        const viewport = new Viewport(
            {
                events: app.renderer.events,
                screenWidth: app.canvas.width,
                screenHeight: app.canvas.height,
                worldWidth: worldSize,
                worldHeight: worldSize,
                allowPreserveDragOutside: true,
            },
            app,
            grid,
        );

        viewport.drag().pinch().wheel().clamp({
            left: true,
            right: true,
            top: true,
            bottom: true,
            direction: "all",
            underflow: "center",
        });

        return viewport;
    }

    public constructor(
        options: IViewportOptions,
        app: Application,
        grid: Grid,
    ) {
        super(options);

        this.app = app;
        this.grid = grid;

        if (isDev()) {
            const line = this.addChild(new Graphics());
            line.setStrokeStyle({ width: 10, color: 0xff0000 })
                // line.setStrokeStyle({ width: 10, color: 0xff0000, pixelLine: true })
                .rect(0, 0, this.worldWidth, this.worldHeight)
                .stroke();
        }
    }
}
