import { Viewport } from "pixi-viewport";
import {
    Application,
    FederatedPointerEvent,
    Graphics,
    Point,
    Sprite,
    Texture,
    warn,
} from "pixi.js";
import { CanvasContextType } from "./context/CanvasContext";
import { EE } from "./events/eventEmitter";
import { startTransition } from "react";

export async function createCanvasAppAndViewport(): Promise<CanvasContextType> {
    function createGrid(width: number, height: number, step: number = 50) {
        const graphics = new Graphics();

        graphics.setStrokeStyle({
            width: 2,
            color: "white",
            alpha: 1,
        });

        // Vertical lines
        for (let x = 0; x <= width; x += step) {
            graphics.moveTo(x, -10);
            graphics.lineTo(x, height + 10);
        }

        for (let y = 0; y <= height; y += step) {
            graphics.moveTo(-10, y);
            graphics.lineTo(width + 10, y);
        }

        graphics.stroke();

        app.stage.addChild(graphics);

        return graphics;
    }

    const app = new Application();
    await app.init();

    document.body.appendChild(app.canvas);
    const viewport = new Viewport({
        events: app.renderer.events,
    });

    // Add the viewport to the stage
    app.stage.addChild(viewport);

    // Create a grid
    const grid = new Graphics();
    viewport.addChild(grid);

    // Function to draw the grid based on viewport position
    function drawGrid() {
        const { x, y, scale } = viewport;
        const gridSize = 50;

        const scaledX = x / scale.x;
        const scaledY = y / scale.y;

        const startX = -Math.ceil(scaledX / gridSize) * gridSize;
        const startY = -Math.ceil(scaledY / gridSize) * gridSize;

        grid.clear();
        grid.lineStyle(3, 0xcccccc, 1);

        const drawToX = startX + app.screen.width / scale.x + gridSize;
        const drawToY = startY + app.screen.height / scale.y + gridSize;

        // Vertical
        for (
            let x = startX;
            x < drawToX;
            x += gridSize
        ) {
            grid.moveTo(x, startY - gridSize);
            grid.lineTo(x, drawToY);
        }

        // Horizontal
        for (
            let y = startY;
            y < startY + app.screen.height / scale.x + gridSize;
            y += gridSize
        ) {
            grid.moveTo(startX - gridSize, y);
            grid.lineTo(startX + app.screen.width / scale.x + gridSize, y);
        }

        grid.stroke();
    }

    // Initial grid draw
    drawGrid();

    // Update the grid when the viewport changes
    viewport.on("moved", drawGrid);

    // Add interaction to the viewport
    viewport.drag().pinch().wheel().decelerate();

    // // add the viewport to the stage
    // app.stage.addChild(viewport);
    //
    // // activate plugins
    // viewport.drag().pinch().wheel().decelerate();
    //
    // const grid = createGrid(app.screen.width, app.screen.height);
    // viewport.addChild(grid);
    //
    // viewport.addEventListener("moved", function (event) {
    //     const viewport = event.viewport as Viewport;
    //     // const localPos = event.viewport.getLocalPosition(sprite.parent);
    //     console.log("grid", grid.position);
    //     console.log("viewport", viewport.position);
    //     // grid.position.x = grid.position.x - viewport.position.x;
    //     // grid.position.y = grid.position.y - viewport.position.y;
    // });
    //
    // add a red box
    let sprite = viewport.addChild(new Sprite(Texture.WHITE));
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = 100;
    sprite.position.set(100, 100);
    sprite.eventMode = "static";
    //
    // sprite.on("pointerdown", (event) => {
    //     EE.emit("test", event.target);
    // });
    //
    // sprite = viewport.addChild(new Sprite(Texture.WHITE));
    // sprite.tint = 0xff00ff;
    // sprite.width = sprite.height = 100;
    // sprite.position.set(200, 100);
    // sprite.eventMode = "static";
    // sprite.cursor = "grabbing";
    // sprite.label = "test sprite";
    //
    // let dragTarget: Sprite | null = null;
    // let position: Point = new Point();
    //
    // function onDragEnd(_event: FederatedPointerEvent) {
    //     if (dragTarget) {
    //         viewport.off("pointermove", onDragMove);
    //         dragTarget.alpha = 1;
    //         dragTarget = null;
    //         viewport.pause = false;
    //     }
    // }
    //
    // viewport.on("pointerup", onDragEnd);
    // viewport.on("pointerupoutside", onDragEnd);
    //
    // function onDragMove(event: FederatedPointerEvent) {
    //     if (dragTarget) {
    //         const localPos = event.getLocalPosition(dragTarget.parent);
    //         dragTarget.position.set(
    //             localPos.x - position.x,
    //             localPos.y - position.y,
    //         );
    //         EE.emit("pos", dragTarget.position);
    //     }
    // }
    //
    // EE.on("changepos", (e: any) => {
    //     console.log(e);
    //     sprite.position.set(e.x, e.y);
    // });
    //
    // sprite.on(
    //     "pointerdown",
    //     (event) => {
    //         viewport.pause = true;
    //         sprite.alpha = 0.5;
    //         dragTarget = sprite;
    //         const localPos = event.getLocalPosition(sprite.parent);
    //         position.x = localPos.x - sprite.position.x;
    //         position.y = localPos.y - sprite.position.y;
    //         viewport.on("pointermove", onDragMove);
    //     },
    //     sprite,
    // );
    //
    // sprite.on("pointerdown", (event) => {
    //     EE.emit("test", event.target);
    // });

    return { app, viewport };
}
