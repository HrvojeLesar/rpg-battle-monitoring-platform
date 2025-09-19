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
    DeleteAction,
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "./interfaces/messagable";
import newUId from "./utils/uuid_generator";
import { isDev } from "../utils/dev_mode";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { sceneAtoms } from "@/board_react_wrapper/stores/board_store";
import { Layer, Layers } from "./layers/layers";

export type SceneAttributes = {
    gridUid: string;
    name: string;
    sortPosition: Maybe<number>;
};

export type SceneOptions = {
    name: string;
    grid?: Grid;
    gridOptions?: GridOptions;
    sortPosition?: number;
    layers?: Layers;
};

const WORLD_SIZE = 6000 * 8;

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

    protected _sortPosition: Maybe<number>;

    protected _layers: Layers;

    protected _selectedLayer: Layer;

    public constructor(options: SceneOptions) {
        this._uid = newUId();
        this.name = options.name;
        this._grid = options.grid ?? new Grid(options.gridOptions);

        this._layers = options.layers ?? Layers.getDefaultLayers();
        this._selectedLayer = this._layers.getLayer("token");

        this._viewport = new Viewport({
            events: GBoard.app.renderer.events,
            screenWidth: GBoard.app.canvas.width,
            screenHeight: GBoard.app.canvas.height,
            worldWidth: WORLD_SIZE,
            worldHeight: WORLD_SIZE,
            allowPreserveDragOutside: true,
            disableOnContextMenu: true,
        });

        this._viewport.label = "viewport";
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
            })
            .clampZoom({
                maxScale: 20,
                minScale: 0.1,
            });

        this._viewport.moveCenter(WORLD_SIZE / 2, WORLD_SIZE / 2);

        if (isDev()) {
            const viewportOutline = new Graphics({ label: "viewportOutline" });
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

        this._viewport.pause = true;

        this._eventStore = new EventStore(this);
        this._selectHandler = new SelectHandler(this, this._eventStore);
        this._dragHandler = new DragHandler(
            this,
            this._selectHandler,
            this._eventStore,
        );

        if (options.grid === undefined) {
            this._grid.position.set(
                WORLD_SIZE / 2 - this._grid.width / 2,
                WORLD_SIZE / 2 - this._grid.height / 2,
            );
        }

        GBoard.eventEmitter.on("keyup", (event) => {
            if (GBoard.scene !== this) {
                return;
            }

            if (event.key === "Delete") {
                this._selectHandler.deleteSelected();
            }

            if (event.key === "ArrowDown") {
                const token = this._selectHandler.selections[0];
                token.zIndex -= 1;
            }

            if (event.key === "ArrowUp") {
                const token = this._selectHandler.selections[0];
                token.zIndex += 1;
            }
        });

        this._layers.gridLayer.addChild(this._grid);

        for (const layer of this._layers.layers) {
            this._viewport.addChild(layer.container);
        }
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

    protected addTokenOld({
        x = 64,
        y = 64,
        tint = "green",
        texture = undefined,
        width = undefined,
        height = undefined,
    }): void {
        const token = new Token(
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
            sortPosition: this._sortPosition,
        };
    }

    public applyUpdateAction(changes: TypedJson<SceneAttributes>): void {
        this._uid = changes.uid;
        this._sortPosition = changes.sortPosition;
        this.name = changes.name;
        GAtomStore.set(sceneAtoms.refreshScenes);
    }

    public deleteAction(action: DeleteAction): void {
        action.acc.push(this);

        GBoard.removeScene(this);

        this.tokens.forEach((token) => {
            token.deleteAction(action);
        });

        this.grid.deleteAction(action);

        action.cleanupCallbacks.push(() => {
            this.viewport.destroy(true);
        });
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

    public addToken(token: Token): void {
        this._selectHandler.registerSelect(token);
        this._dragHandler.registerDrag(token);

        this._tokens.add(token);
        this._layers.tokenLayer.addChild(token);
    }

    public removeToken(token: Token): void {
        this._tokens.remove(token);
        this._selectHandler.unregisterSelect(token);
        this._dragHandler.unregisterDrag(token);
        this._layers.tokenLayer.removeChild(token);
    }

    public selectLayer(layer: Layer | string): void {
        if (
            (typeof layer === "string" && layer === this._selectedLayer.name) ||
            (typeof layer === "object" && layer === this._selectedLayer)
        ) {
            return;
        }

        this._selectedLayer = this._layers.getLayer(layer);

        this._layers.layers.forEach(({ container }) => {
            container.eventMode = "none";
        });

        this._selectedLayer.container.eventMode = "passive";

        this._selectHandler.clearSelections();
    }

    public get selectedLayer(): Layer {
        return this._selectedLayer;
    }

    public set selectedLayer(layer: Layer | string) {
        this.selectLayer(layer);
    }
}
