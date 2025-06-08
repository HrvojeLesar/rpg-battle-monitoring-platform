import { Application, Sprite, Texture } from "pixi.js";
import "./pixi_extensions/container";
import { ApplicationManager } from "./managers/application_manager";
import { ReactPixiJsBridgeEventEmitter } from "../types/event_emitter";

export function init(
    app: Application,
    eventEmitter: ReactPixiJsBridgeEventEmitter,
): ApplicationManager {
    const applicationManager = ApplicationManager.default(app, eventEmitter);

    app.canvas.ondrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const grid = applicationManager.grid;
    const entityManager = applicationManager.entityManager;

    let sprite = new Sprite(Texture.WHITE);
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = grid.cellSize * 3;
    sprite.position.set(64, 64);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.canSnapToGrid = true;
    sprite.alpha = 0.5;

    entityManager.addPlayableEntity(sprite);

    sprite = new Sprite(Texture.WHITE);
    sprite.width = sprite.height = grid.cellSize * 3;
    sprite.position.set(128, 128);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.canSnapToGrid = true;

    entityManager.addPlayableEntity(sprite);

    return applicationManager;
}
