import { FederatedPointerEvent } from "pixi.js";
import { Action } from "../actions/action";
import { TargetSelectionLayer } from "../layers/traget_selection_layer";
import { RpgScene } from "../scene/scene";
import { RpgToken } from "../tokens/rpg_token";
import { InRangeHandler } from "./in_range_handler";
import { OccupiedSpaceHandler } from "./occupied_space_handler";
import { TargetTokenOverlay } from "../graphics/target_token_overlay";
import { queueEntityUpdate } from "@/websocket/websocket";

export type TargetSelectionHandlerOptions = {
    scene: RpgScene;
};

export class TargetSelectionHandler {
    public scene: RpgScene;
    public targetSelectionLayer: TargetSelectionLayer;
    public inRangeHandler: InRangeHandler;
    public occupiedSpaceHandler: OccupiedSpaceHandler;

    public constructor(options: TargetSelectionHandlerOptions) {
        this.scene = options.scene;
        this.targetSelectionLayer = this.scene.targetSelectionLayer;
        this.inRangeHandler = this.scene.inRangeHandler;
        this.occupiedSpaceHandler = this.scene.occupiedSpaceHandler;
    }

    public doAction(initiator: RpgToken, action: Action): void {
        this.startAction();

        const range = action.cellRange;

        // TODO: filter out invalid targets
        const targets = this.inRangeHandler.tokensInRange(initiator, range);

        this.inRangeHandler.highlightTokensInRange(initiator, range, targets);

        // TODO: Handle here the kind of selection it needs to be
        // currently only supported is direct target
        this.overlayTargetTokens(initiator, targets, action);
    }

    public cancelAction(): void {
        this.targetSelectionLayer.deactivate();
        this.inRangeHandler.clearHighlight();
    }

    protected startAction(): void {
        this.cancelAction();
        this.targetSelectionLayer.activate();
    }

    protected overlayTargetTokens(
        initiator: RpgToken,
        tokens: RpgToken[],
        action: Action,
    ): void {
        tokens.forEach((token) => {
            this.newTokenOverlay(initiator, token, action);
        });
    }

    protected newTokenOverlay(
        initiator: RpgToken,
        token: RpgToken,
        action: Action,
    ): TargetTokenOverlay {
        const overlay = new TargetTokenOverlay(
            token,
            (event: FederatedPointerEvent, token: RpgToken) => {
                this.singleTargetSelect(event, token, action, initiator);
            },
        );
        this.targetSelectionLayer.addChild(overlay);

        return overlay;
    }

    protected singleTargetSelect(
        _event: FederatedPointerEvent,
        target: RpgToken,
        action: Action,
        initiator: RpgToken,
    ): void {
        this.cancelAction();
        const damagedTargets = action.damageTarget(initiator, target);

        queueEntityUpdate(() => {
            return damagedTargets
                .filter((target) => target instanceof RpgToken)
                .map((target) => target.tokenData);
        });
    }
}
