import { Viewport } from "pixi-viewport";
import { Grid } from "./grid";
import { GBoard } from "./board";
import { UniqueCollection } from "./utils/unique_collection";
import { Token } from "./token";
import { Texture } from "pixi.js";
import { SelectionBox } from "./selection/selection_box";
import { SpriteExtension } from "./extensions/sprite_extension";

export class Scene {
    public readonly name: string;
    protected _viewport: Viewport;
    protected _grid: Grid;
    protected _selectionBox: SelectionBox;
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

        this._viewport = new Viewport({
            events: GBoard.app.renderer.events,
            screenWidth: GBoard.app.canvas.width,
            screenHeight: GBoard.app.canvas.height,
            worldWidth: worldSize,
            worldHeight: worldSize,
            allowPreserveDragOutside: true,
            disableOnContextMenu: true,
        });

        this._viewport
            .drag({
                mouseButtons: "middle-right",
            })
            .pinch()
            .wheel()
            .clamp({
                left: true,
                right: true,
                top: true,
                bottom: true,
                direction: "all",
                underflow: "center",
            });

        this._viewport.addChild(this._grid);
        this._viewport.pause = true;

        this._selectionBox = new SelectionBox(this._viewport);

        this.addToken({});
        this.addToken({ x: 256, y: 256, tint: "red" });
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

    public get tokens(): Readonly<Token[]> {
        return this._tokens.getItems();
    }

    protected addToken({ x = 64, y = 64, tint = "green" }): void {
        const sprite = new SpriteExtension(
            {
                texture: Texture.WHITE,
                tint: tint,
                width: this._grid.cellSize * 3,
                height: this._grid.cellSize * 3,
                alpha: 0.5,
            },
            {
                isSnapping: true,
                isDraggable: true,
                isSelectable: true,
                eventMode: "static",
                cursor: "pointer",
                position: { x: x, y: y },
            },
        );

        const token = new Token(sprite);

        this._tokens.add(token);
        this._viewport.addChild(token.container);
    }
}
