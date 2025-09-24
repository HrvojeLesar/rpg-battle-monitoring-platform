import { ContainerExtensionOptions } from "@/board_core/extensions/container_extension";
import { Scene } from "@/board_core/scene";
import { Token } from "@/board_core/token/token";
import { SpriteOptions } from "pixi.js";
import { RpgTokenData } from "./rpg_token_data";
import { sizeToGridCellMultiplier } from "../characters_stats/combat";
import { DeleteAction } from "@/board_core/interfaces/messagable";
import { TurnOrder } from "../turn/turn_order";
import { GBoard } from "@/board_core/board";
import { queueEntityUpdate } from "@/websocket/websocket";

export class RpgToken extends Token {
    public constructor(
        scene: Scene,
        tokenData: RpgTokenData,
        spriteOptions?: SpriteOptions,
        containerOptions?: ContainerExtensionOptions,
    ) {
        super(scene, tokenData, spriteOptions, containerOptions);

        if (this.displayedEntity) {
            this.displayedEntity.width =
                scene.grid.cellSize *
                sizeToGridCellMultiplier(this.tokenData.size);
            this.displayedEntity.height =
                scene.grid.cellSize *
                sizeToGridCellMultiplier(this.tokenData.size);
        }
    }

    public get tokenData(): RpgTokenData {
        return this._tokenData as RpgTokenData;
    }

    public getAssoicatedTurnOrders(): TurnOrder[] {
        return GBoard.entityRegistry.entities.list(
            (entity) =>
                entity instanceof TurnOrder && entity.isTokenInTurnOrder(this),
        ) as TurnOrder[];
    }

    public deleteAction(action: DeleteAction): void {
        super.deleteAction(action);

        const turnOrders = this.getAssoicatedTurnOrders();

        action.cleanupCallbacks.push(() => {
            queueEntityUpdate(() => {
                for (const turnOrder of turnOrders) {
                    turnOrder.removeToken(this);
                }

                return turnOrders;
            });
        });
    }
}
