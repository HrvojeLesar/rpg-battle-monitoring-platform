import { type IViewportOptions, Viewport as PixiViewport } from "pixi-viewport";
import { isDev } from "../../utils/dev_mode";
import { Application, Graphics } from "pixi.js";
import { Grid } from "../grid";
import { ReactPixiJsBridgeEventEmitter } from "../../types/event_emitter";

export class Viewport extends PixiViewport {
    public static readonly WORLD_SIZE = 6000;

    protected app: Application;
    protected grid: Grid;

    public readonly eventEmitter: ReactPixiJsBridgeEventEmitter;

    public static default(
        app: Application,
        grid: Grid,
        eventEmitter: ReactPixiJsBridgeEventEmitter,
    ): Viewport {
        const gridSize = grid.size;

        function getWorldSize() {
            return Math.round(
                // TODO: make sure grid is in the center of viewport and create viewport 4 times larger than grid
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
            eventEmitter,
        );

        viewport.drag().pinch().wheel().clamp({
            left: true,
            right: true,
            top: true,
            bottom: true,
            direction: "all",
            underflow: "center",
        });

        viewport.on("moved", (event) => {
            eventEmitter.emit("viewportMoved", {
                viewport: event.viewport,
                type: "move",
            });
        });

        viewport.on("zoomed", (event) => {
            eventEmitter.emit("viewportMoved", {
                viewport: event.viewport,
                type: "zoom",
            });
        });

        return viewport;
    }

    public constructor(
        options: IViewportOptions,
        app: Application,
        grid: Grid,
        eventEmitter: ReactPixiJsBridgeEventEmitter,
    ) {
        super(options);

        this.app = app;
        this.grid = grid;
        this.eventEmitter = eventEmitter;

        if (isDev()) {
            const line = this.addChild(new Graphics());
            line.setStrokeStyle({ width: 10, color: 0xff0000 })
                // line.setStrokeStyle({ width: 10, color: 0xff0000, pixelLine: true })
                .rect(0, 0, this.worldWidth, this.worldHeight)
                .stroke();
        }
    }
}
