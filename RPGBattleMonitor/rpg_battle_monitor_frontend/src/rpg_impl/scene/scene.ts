import { Scene, SceneOptions } from "@/board_core/scene";
import { TurnOrder } from "../turn/turn_order";
import { removeAndFlushEntities } from "@/board_core/utils/remove_and_flush_entities";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { turnOrderAtoms } from "../stores/turn_order_store";
import { DeleteAction } from "@/board_core/interfaces/messagable";
import { defaultLayers, Layer, Layers } from "@/board_core/layers/layers";
import { Container } from "pixi.js";
import { RpgDragHandler } from "../handlers/rpg_drag_handler";
import { Token } from "@/board_core/token/token";
import { RpgToken } from "../tokens/rpg_token";
import { InRangeHandler } from "../handlers/in_range_handler";
import { OccupiedSpaceHandler } from "../handlers/occupied_space_handler";
import { TargetSelectionLayer } from "../layers/traget_selection_layer";
import { TargetSelectionHandler } from "../handlers/target_selection_handler";

export type RpgSceneOptions = { turnOrder?: TurnOrder } & SceneOptions;

function defaultLayersExt() {
    const layers = defaultLayers();

    const dragLayer = {
        name: "drag",
        container: new Container({
            label: "dragLayer",
            eventMode: "none",
        }),
        zIndex: 3,
        label: "Drag layer",
    };

    const defaultLayersExt = [...layers, dragLayer];
    defaultLayersExt[2].zIndex = dragLayer.zIndex + 1;

    return defaultLayersExt;
}

export class RpgScene extends Scene {
    protected _turnOrder: Maybe<TurnOrder>;
    protected _rpgDragHandler: RpgDragHandler;
    protected _inRangeHandler: InRangeHandler;
    protected _occupiedSpaceHandler: OccupiedSpaceHandler;
    protected _targetSelectionHandler: TargetSelectionHandler;

    public constructor(options: RpgSceneOptions) {
        super({
            layers: new Layers(defaultLayersExt()),
            ...options,
        });

        const targetSelectionLayerConstructor = {
            name: "targetSelection",
            container: new TargetSelectionLayer(this),
            zIndex: this.layers.layers.length,
            label: "Target selection layer",
        };

        this.layers.getLayer(targetSelectionLayerConstructor);

        this._turnOrder = options.turnOrder;

        this._rpgDragHandler = new RpgDragHandler(
            this,
            this._selectHandler,
            this._eventStore,
        );

        this._inRangeHandler = new InRangeHandler(this);
        this._occupiedSpaceHandler = new OccupiedSpaceHandler(this);

        this.addLayersToStage();

        this._targetSelectionHandler = new TargetSelectionHandler({
            scene: this,
        });
    }

    public get turnOrder(): Maybe<TurnOrder> {
        return this._turnOrder;
    }

    public set turnOrder(turnOrder: Maybe<TurnOrder>) {
        if (
            this._turnOrder &&
            this._turnOrder.getUId() !== turnOrder?.getUId()
        ) {
            removeAndFlushEntities(this._turnOrder);
        }

        this._turnOrder = turnOrder;

        GAtomStore.set(turnOrderAtoms.currentTurnOrder);
    }

    public deleteAction(action: DeleteAction): void {
        super.deleteAction(action);

        if (this._turnOrder) {
            this._turnOrder.deleteAction(action);
        }
    }

    protected addLayersToStage(): void {
        for (const layer of this._layers.layers) {
            this._viewport.addChild(layer.container);
        }
    }

    public get dragLayer(): Layer {
        return this.layers.getLayer("drag");
    }

    protected override registerHandlersToToken(token: Token): void {
        if (token instanceof RpgToken) {
            this._selectHandler.registerSelect(token);
            this._rpgDragHandler.registerDrag(token);
        } else {
            super.registerHandlersToToken(token);
        }
    }

    protected override unregisterHandlersFromToken(token: Token): void {
        if (token instanceof RpgToken) {
            this._selectHandler.unregisterSelect(token);
            this._rpgDragHandler.unregisterDrag(token);
        } else {
            super.unregisterHandlersFromToken(token);
        }
    }

    public get inRangeHandler(): InRangeHandler {
        return this._inRangeHandler;
    }

    public get rpgTokens(): RpgToken[] {
        const sceneTokens = this.tokens;

        return sceneTokens.filter(
            (token) => token instanceof RpgToken,
        ) as RpgToken[];
    }

    public get occupiedSpaceHandler(): OccupiedSpaceHandler {
        return this._occupiedSpaceHandler;
    }

    public get targetSelectionLayer(): TargetSelectionLayer {
        return this.layers.getLayer("targetSelection")
            .container as TargetSelectionLayer;
    }

    public get targetSelectionHandler(): TargetSelectionHandler {
        return this._targetSelectionHandler;
    }
}
