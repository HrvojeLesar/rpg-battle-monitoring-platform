import { ContainerExtensionOptions } from "@/board_core/extensions/container_extension";
import { Scene } from "@/board_core/scene";
import { Token, TokenAttributes } from "@/board_core/token/token";
import { DestroyOptions, Point, SpriteOptions, Ticker } from "pixi.js";
import { RpgTokenData } from "./rpg_token_data";
import { sizeToGridCellMultiplier } from "../characters_stats/combat";
import { DeleteAction, TypedJson } from "@/board_core/interfaces/messagable";
import { TurnOrder } from "../turn/turn_order";
import { GBoard } from "@/board_core/board";
import { queueEntityUpdate } from "@/websocket/websocket";
import { GRpgTokenAnimator } from "../handlers/animate";
import { OnTurnMarker } from "../graphics/on_turn_marker";
import { RpgScene } from "../scene/scene";

export class RpgToken extends Token {
    protected onTurnMarker: OnTurnMarker;

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

        this.isResizable = false;

        this.onTurnMarker = new OnTurnMarker({
            token: this,
        });
        this.onTurnMarker.visible = false;
        this.addChild(this.onTurnMarker);

        this.addUpdateFnToTicker();
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

    public applyUpdateAction(changes: TypedJson<TokenAttributes>): void {
        // const oldPosition = this.position.clone();
        super.applyUpdateAction(changes);

        // this.position.set(oldPosition.x, oldPosition.y);
        //
        // GRpgTokenAnimator.animateMove(
        //     this,
        //     new Point(changes.position.x, changes.position.y),
        // );
    }

    public destroy(options?: DestroyOptions): void {
        this.removeUpdateFnFromTicker();
        super.destroy(options);
    }

    protected addUpdateFnToTicker(): void {
        this.removeUpdateFnFromTicker();
        if (this.scene instanceof RpgScene) {
            GBoard.app.ticker.add(this.update, this);
        }
    }

    protected removeUpdateFnFromTicker(): void {
        GBoard.app.ticker.remove(this.update, this);
    }

    public set scene(value: Scene) {
        this._scene = value;

        this.addUpdateFnToTicker();
    }

    public get scene(): Scene {
        return this._scene;
    }

    protected update(ticker: Ticker): void {
        if (this.scene instanceof RpgScene) {
            this.updateOnTurnMarker(this.scene, ticker);
        }
    }

    protected updateOnTurnMarker(scene: RpgScene, _ticker: Ticker): void {
        const turnOrder = scene.turnOrder;
        if (turnOrder === undefined) {
            return;
        }

        if (turnOrder.isInCombat() && turnOrder.isOnTurn(this)) {
            this.onTurnMarker.visible = true;
        } else {
            this.onTurnMarker.visible = false;
        }
    }
}
