import { Application, Sprite, Texture } from "pixi.js";
import { Grid } from "./grid";
import { registerPositionEvents } from "./managers/position_manager";

export function init(app: Application) {
    const grid = new Grid(app);
    app.stage.addChild(grid);

    let sprite = new Sprite(Texture.WHITE);
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = 100;
    sprite.position.set(125, 100);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";

    app.stage.addChild(sprite);
    registerPositionEvents(sprite, app);

    sprite = new Sprite(Texture.WHITE);
    sprite.width = sprite.height = 100;
    sprite.position.set(200, 100);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";

    app.stage.addChild(sprite);
    registerPositionEvents(sprite, app);
}
