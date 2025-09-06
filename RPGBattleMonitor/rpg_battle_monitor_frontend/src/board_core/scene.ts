import { Viewport } from "pixi-viewport";
import { GBoard } from "./board";
import { UniqueCollection } from "./utils/unique_collection";
import { Graphics, Texture } from "pixi.js";
import { DragHandler } from "./handlers/drag_handler";
import { EventStore } from "./handlers/registered_event_store";
import { SelectHandler } from "./handlers/select_handler";
import { Grid, GridOptions } from "./grid/grid";
import { Token } from "./token/token";
import { EmptyTokenData } from "./token/empty_token_data";
import {
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "./interfaces/messagable";
import newUId from "./utils/uuid_generator";
import { isDev } from "../utils/dev_mode";

export type SceneAttributes = {
    gridUid: string;
    name: string;
};

export type SceneOptions = {
    name: string;
    grid?: Grid;
    gridOptions?: GridOptions;
};

export class Scene implements IMessagable<SceneAttributes> {
    public name: string;
    protected _viewport: Viewport;
    protected _grid: Grid;
    protected _tokens: UniqueCollection<Token> = new UniqueCollection();

    protected _dragHandler: DragHandler;
    protected _eventStore: EventStore;
    protected _selectHandler: SelectHandler;

    protected _lastChangesTimestamp: Maybe<number> = undefined;

    private _uid: UId;
    protected _dependants: UniqueCollection<IMessagable> =
        new UniqueCollection();

    public constructor(options: SceneOptions) {
        this._uid = newUId();
        this.name = options.name;
        this._grid = options.grid ?? new Grid(options.gridOptions);
        this.grid.addDependant(this);

        const gridSize = this._grid.size;

        function getWorldSize() {
            return Math.round(Math.max(gridSize.width, gridSize.height) * 4);
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

        this._viewport.moveCenter(worldSize / 2, worldSize / 2);

        this._grid.position.set(
            worldSize / 2 - this._grid.width / 2,
            worldSize / 2 - this._grid.height / 2,
        );

        if (isDev()) {
            const viewportOutline = new Graphics();
            viewportOutline
                .rect(
                    0,
                    0,
                    this._viewport.worldWidth,
                    this._viewport.worldHeight,
                )
                .stroke({ color: "red", width: 25 });
            this._viewport.addChild(viewportOutline);
        }

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

        // const timeout = setTimeout(() => {
        // this.tokens[0].container.moveToGridCell(new Point(7, 1));
        // this.addToken({ x: 256, y: 512, tint: "green" });
        // clearTimeout(timeout);
        // }, 5000);
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
        const token = new Token(
            this.grid,
            this,
            new EmptyTokenData(),
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

        GBoard.entityRegistry.entities.add(token);

        // WARN: Order matters, try changing so any order is valid
        this._selectHandler.registerSelect(token);
        this._dragHandler.registerDrag(token);

        this._tokens.add(token);
        this._viewport.addChild(token);
    }

    public getKind(): string {
        return this.constructor.name;
    }

    public getUId(): UId {
        return this._uid;
    }

    public setUId(uid: UId): void {
        this._uid = uid;
    }

    public toJSON(): TypedJson<SceneAttributes> {
        return {
            ...this.getAttributes(),
            kind: this.getKind(),
            uid: this.getUId(),
            timestamp: Date.now(),
        };
    }

    public getAttributes(): SceneAttributes {
        return {
            gridUid: this._grid.getUId(),
            name: this.name,
        };
    }

    public applyUpdateAction(changes: TypedJson<SceneAttributes>): void {
        this._sortPosition = changes.sortPosition;
        this.name = changes.name;
    }

    public deleteAction(): void {
        this._dependants.items.forEach((entity) => {
            entity.deleteAction();
        });
    }

    public addDependant(entity: IMessagable): void {
        this._dependants.add(entity);
    }

    public static getKindStatic(): string {
        return this.name;
    }

    public get sortPosition(): Maybe<number> {
        return this._sortPosition;
    }

    public set sortPosition(sortPosition: Maybe<number>) {
        this._sortPosition = sortPosition;
    }

    public getLastChangesTimestamp(): Maybe<number> {
        return this._lastChangesTimestamp;
    }

    public shouldApplyChanges(changes: TypedJson<SceneAttributes>): boolean {
        return shouldApplyChanges(this, changes);
    }
}
