import { Application, Sprite, Texture } from "pixi.js";
import { Grid } from "./grid";
import { PositionManager } from "./managers/position_manager";
import { ViewportExtended } from "./viewport/viewport_extended";
import "./pixi_extensions/container";

export const GRID_PIXELS = 300;
export const GRID_SIZE = 3000;

export function init(app: Application) {
    const viewport = new ViewportExtended({
        events: app.renderer.events,
        screenWidth: app.canvas.width,
        screenHeight: app.canvas.height,
        worldWidth: GRID_SIZE,
        worldHeight: GRID_SIZE,
        allowPreserveDragOutside: true,
    });

    app.canvas.ondrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const positionManger = new PositionManager(app, viewport);

    viewport.drag().pinch().wheel().clamp({
        left: true,
        right: true,
        top: true,
        bottom: true,
        direction: "all",
        underflow: "center",
    });

    app.stage.addChild(viewport);

    const grid = new Grid(app);
    // app.stage.addChild(grid);
    viewport.addChild(grid);

    let sprite = new Sprite(Texture.WHITE);
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = GRID_PIXELS * 3;
    sprite.position.set(64, 64);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.canSnapToGrid = true;
    sprite.alpha = 0.5;

    viewport.addChild(sprite);
    // app.stage.addChild(sprite);
    positionManger.registerPositionEvents(sprite);

    sprite = new Sprite(Texture.WHITE);
    sprite.width = sprite.height = GRID_PIXELS * 3;
    sprite.position.set(128, 128);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.canSnapToGrid = true;

    viewport.addChild(sprite);
    // app.stage.addChild(sprite);
    positionManger.registerPositionEvents(sprite);
}
