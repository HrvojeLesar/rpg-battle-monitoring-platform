import { Application, Sprite, Texture } from "pixi.js";
import { Grid } from "./grid";
import { registerPositionEvents } from "./managers/position_manager";

export function init(app: Application) {
    const grid = new Grid(app);
    app.stage.addChild(grid);

    let sprite = new Sprite(Texture.WHITE);
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = 32 * 3;
    sprite.position.set(64, 64);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.snapToGrid = true;

    app.stage.addChild(sprite);
    registerPositionEvents(sprite, app);

    sprite = new Sprite(Texture.WHITE);
    sprite.width = sprite.height = 32 * 3;
    sprite.position.set(128, 128);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.snapToGrid = true;

    app.stage.addChild(sprite);
    registerPositionEvents(sprite, app);
}
