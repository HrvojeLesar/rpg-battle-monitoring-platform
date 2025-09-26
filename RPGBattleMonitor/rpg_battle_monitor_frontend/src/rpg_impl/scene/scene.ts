import { Scene, SceneOptions } from "@/board_core/scene";
import { TurnOrder } from "../turn/turn_order";
import { removeAndFlushEntities } from "@/board_core/utils/remove_and_flush_entities";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { turnOrderAtoms } from "../stores/turn_order_store";
import { DeleteAction } from "@/board_core/interfaces/messagable";
import { RpgToken } from "../tokens/rpg_token";
import { OnTurnMarker } from "../graphics/on_turn_marker";

export type RpgSceneOptions = { turnOrder?: TurnOrder } & SceneOptions;

export class RpgScene extends Scene {
    protected _turnOrder: Maybe<TurnOrder>;

    public constructor(options: RpgSceneOptions) {
        super(options);

        this._turnOrder = options.turnOrder;
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

    public updateTurnMarker(): void {
        const turnOrder = this._turnOrder;
        if (turnOrder) {
            const tokens = this.tokens.filter(
                (token) => token instanceof RpgToken,
            );

            this.clearTurnMarkers(tokens);
            if (turnOrder.isInCombat()) {
                const turnEntry = turnOrder.getTokenOnTurn();
                if (turnEntry) {
                    const marker = new OnTurnMarker({
                        token: turnEntry.token,
                    });

                    turnEntry.token.addChild(marker);
                }
            }
        }
    }

    protected clearTurnMarkers(tokens: RpgToken[]): void {
        tokens.forEach((token) =>
            token.children
                .filter((child) => child instanceof OnTurnMarker)
                .forEach((child) => child.destroy(true)),
        );
    }
}
