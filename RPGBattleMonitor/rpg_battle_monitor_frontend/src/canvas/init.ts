import { Application, Sprite, Texture } from "pixi.js";
import "./pixi_extensions/container";
import { ApplicationManager } from "./managers/application_manager";

export function init(app: Application) {
    const applicationManager = ApplicationManager.default(app);

    app.canvas.ondrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const viewport = applicationManager.viewport;
    const positionManger = applicationManager.positionManager;
    const grid = applicationManager.grid;

    let sprite = new Sprite(Texture.WHITE);
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = grid.cellSize * 3;
    sprite.position.set(64, 64);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.canSnapToGrid = true;
    sprite.alpha = 0.5;

    viewport.addChild(sprite);
    // app.stage.addChild(sprite);
    positionManger.registerPositionEvents(sprite);

    sprite = new Sprite(Texture.WHITE);
    sprite.width = sprite.height = grid.cellSize * 3;
    sprite.position.set(128, 128);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.canSnapToGrid = true;

    viewport.addChild(sprite);
    // app.stage.addChild(sprite);
    positionManger.registerPositionEvents(sprite);
}
