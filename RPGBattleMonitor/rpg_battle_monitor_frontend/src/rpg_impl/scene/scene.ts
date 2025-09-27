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

    public constructor(options: RpgSceneOptions) {
        super({
            layers: new Layers(defaultLayersExt()),
            ...options,
        });

        this._turnOrder = options.turnOrder;

        this._rpgDragHandler = new RpgDragHandler(
            this,
            this._selectHandler,
            this._eventStore,
        );
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
            super.unregisterHandlersFromToken(token);
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
}
