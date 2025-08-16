import { Viewport } from "pixi-viewport";
import { GBoard } from "./board";
import { UniqueCollection } from "./utils/unique_collection";
import { Assets, Point, Texture } from "pixi.js";
import { SpriteExtension } from "./extensions/sprite_extension";
import { DragHandler } from "./handlers/drag_handler";
import { EventStore } from "./handlers/registered_event_store";
import { SelectHandler } from "./handlers/select_handler";
import { Grid } from "./grid/grid";
import { Token } from "./token/token";

export class Scene {
    public readonly name: string;
    protected _viewport: Viewport;
    protected _grid: Grid;
    protected _tokens: UniqueCollection<Token> = new UniqueCollection();

    protected _dragHandler: DragHandler;
    protected _eventStore: EventStore;
    protected _selectHandler: SelectHandler;

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

        this._eventStore = new EventStore(this);
        this._selectHandler = new SelectHandler(this, this._eventStore);
        this._dragHandler = new DragHandler(
            this,
            this._selectHandler,
            this._eventStore,
        );

        Assets.load("https://pixijs.com/assets/bunny.png").then((texture) => {
            this.addToken({
                x: 512,
                y: 512,
                texture,
                tint: "white",
                height: 300,
            });
            // const control = this.tokens[this.tokens.length - 2];
            // const resizecontainer = this.tokens[this.tokens.length - 1];
            // control.container.unregisterDraggable();
            // control.container.unregisterSelectable();
            // GResizeHandler.registerResize(
            //     control.container,
            //     resizecontainer.container,
            // );
        });
        this.addToken({});
        this.addToken({ x: 256, y: 256, tint: "red" });
        this.addToken({ x: 256, y: 512, tint: "blue" });

        const timeout = setTimeout(() => {
            this.tokens[0].container.moveToGridCell(new Point(7, 1));
            // this.addToken({ x: 256, y: 512, tint: "green" });
            // clearTimeout(timeout);
        }, 5000);
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

    public get eventStore(): EventStore {
        return this._eventStore;
    }

    protected addToken({
        x = 64,
        y = 64,
        tint = "green",
        texture = undefined,
        width = undefined,
        height = undefined,
    }): void {
        const sprite = new SpriteExtension(
            this.grid,
            {
                texture: texture ?? Texture.WHITE,
                tint: tint,
                width: width ?? this._grid.cellSize * 3,
                height: height ?? this._grid.cellSize * 3,
                alpha: 0.5,
            },
            {
                isSnapping: tint === "red" ? false : true,
                isDraggable: true,
                isSelectable: tint === "blue" ? false : true,
                isResizable: true,
                eventMode: "static",
                cursor: "pointer",
                position: { x: x, y: y },
            },
        );

        const token = new Token(sprite, this.grid);

        // WARN: Order matters, try changing so any order is valid
        this._selectHandler.registerSelect(token.container);
        this._dragHandler.registerDrag(token.container);

        this._tokens.add(token);
        this._viewport.addChild(token.container);
    }
}
