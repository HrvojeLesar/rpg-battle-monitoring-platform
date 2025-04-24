import { Application } from "pixi.js";
import { Grid } from "./grid";

export function init(app: Application) {
    const grid = new Grid(app);

    app.stage.addChild(grid);
}
