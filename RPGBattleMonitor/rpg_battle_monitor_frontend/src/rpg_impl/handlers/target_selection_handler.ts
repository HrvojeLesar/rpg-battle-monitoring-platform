import { FederatedPointerEvent } from "pixi.js";
import { Action, ActionOnFinished } from "../actions/action";
import { TargetSelectionLayer } from "../layers/traget_selection_layer";
import { RpgScene } from "../scene/scene";
import { RpgToken } from "../tokens/rpg_token";
import { InRangeHandler } from "./in_range_handler";
import { OccupiedSpaceHandler } from "./occupied_space_handler";
import { TargetTokenOverlay } from "../graphics/target_token_overlay";
import { queueEntityUpdate } from "@/websocket/websocket";
import { notifications } from "@mantine/notifications";
import { infoNotification } from "../utils/notification_utils";

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

    public doAction(
        initiator: RpgToken,
        action: Action,
        actionFinishedCallback?: ActionOnFinished,
    ): void {
        this.startAction();

        const range = action.cellRange;

        const targets = action
            .filterTargets(
                initiator,
                this.inRangeHandler.tokensInRange(initiator, range),
            )
            .filter((target) => target instanceof RpgToken);

        if (targets.length === 0) {
            this.cancelAction();
            notifications.show(
                infoNotification(
                    "No targets in range",
                    "There are no valid targets in range",
                ),
            );

            return;
        }

        this.inRangeHandler.highlightTokensInRange(initiator, range, targets);

        // TODO: Handle here the kind of selection it needs to be
        // currently only supported is direct target
        this.overlayTargetTokens(
            initiator,
            targets,
            action,
            actionFinishedCallback,
        );
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
        onFinished?: ActionOnFinished,
    ): void {
        tokens.forEach((token) => {
            this.newTokenOverlay(initiator, token, action, onFinished);
        });
    }

    protected newTokenOverlay(
        initiator: RpgToken,
        token: RpgToken,
        action: Action,
        onFinished?: ActionOnFinished,
    ): TargetTokenOverlay {
        const overlay = new TargetTokenOverlay(
            token,
            initiator,
            (event, token, type) => {
                if (type === "selectTarget") {
                    this.targetSelectionLayer.children.forEach((child) => {
                        if (
                            child instanceof TargetTokenOverlay &&
                            child !== overlay
                        ) {
                            child.destroyArrow();
                        }
                    });
                } else {
                    this.singleTargetSelect(
                        event,
                        token,
                        action,
                        initiator,
                        onFinished,
                    );
                }
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
        onFinished?: ActionOnFinished,
    ): void {
        this.cancelAction();
        action.doAction(_event, target, initiator, onFinished);
    }
}
