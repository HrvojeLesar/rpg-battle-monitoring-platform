import { Viewport } from "pixi-viewport";
import { Grid } from "./grid";
import { GBoard } from "./board";
import { UniqueCollection } from "./utils/unique_collection";
import { Token } from "./token";
import { SpriteMixin } from "./mixins/mixin_classess";
import { Texture } from "pixi.js";

export class Scene {
    public readonly name: string;
    protected _viewport: Viewport;
    protected _grid: Grid;
    protected _tokens: UniqueCollection<Token> = new UniqueCollection();

    public constructor(name: string) {
        this.name = name;
        this._grid = new Grid();

        const gridSize = this._grid.size;

        function getWorldSize() {
            return Math.round(
                // TODO: make sure grid is in the center of viewport and create viewport 4 times larger than grid
                // Math.max(gridSize.width, gridSize.height, Viewport.WORLD_SIZE),
                Math.max(gridSize.width, gridSize.height),
            );
        }

        const worldSize = getWorldSize();
        const app = GBoard.getApplication();

        this._viewport = new Viewport({
            events: app.renderer.events,
            screenWidth: app.canvas.width,
            screenHeight: app.canvas.height,
            worldWidth: worldSize,
            worldHeight: worldSize,
            allowPreserveDragOutside: true,
        });

        this._viewport.drag().pinch().wheel().clamp({
            left: true,
            right: true,
            top: true,
            bottom: true,
            direction: "all",
            underflow: "center",
        });

        this._viewport.addChild(this._grid);
        this._viewport.pause = true;
        this.addToken();
    }

    public setActive(): void {
        this._viewport.pause = false;
        GBoard.app.stage.addChild(this._viewport);
    }

    public cleanup(): void {
        this._viewport.pause = true;
        GBoard.app.stage.removeChild(this._viewport);
    }

    public get viewport(): Viewport {
        return this._viewport;
    }

    public get grid(): Grid {
        return this._grid;
    }

    protected addToken(): void {
        const spriteMixin = new SpriteMixin({
            texture: Texture.WHITE,
            tint: "blue",
            width: this._grid.cellSize * 3,
            height: this._grid.cellSize * 3,
            position: { x: 64, y: 64 },
            eventMode: "static",
            cursor: "pointer",
            alpha: 0.5,
            // TODO: get the typescript compiler to recognise these options
            // isSnapping: false,
            // isMovable: true,
        });
        spriteMixin.isSnapping = true;
        spriteMixin.isMovable = true;

        const token = new Token(spriteMixin);

        this._tokens.add(token);
        this._viewport.addChild(token.container);
    }
}
