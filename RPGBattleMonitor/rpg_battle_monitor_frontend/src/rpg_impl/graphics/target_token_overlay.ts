import {
    Container,
    DestroyOptions,
    FederatedPointerEvent,
    Graphics,
} from "pixi.js";
import { RpgToken } from "../tokens/rpg_token";
import { Arrow } from "./arrow";

export type SelectTargetType = "selectTarget" | "attack";

export class TargetTokenOverlay extends Container {
    public targetToken: RpgToken;
    public initiatorToken: RpgToken;
    public overlayGraphics: Graphics;
    public onClickCallback: (event: FederatedPointerEvent) => void;
    public arrow: Maybe<Arrow>;

    public constructor(
        targetToken: RpgToken,
        initiatorToken: RpgToken,
        selectTargetCallback: (
            event: FederatedPointerEvent,
            token: RpgToken,
            type: SelectTargetType,
        ) => void,
    ) {
        super({
            eventMode: "static",
        });

        this.initiatorToken = initiatorToken;

        this.targetToken = targetToken;

        this.overlayGraphics = new Graphics({
            eventMode: "static",
            cursor: "pointer",
        });
        this.overlayGraphics.rect(
            this.targetToken.position.x,
            this.targetToken.position.y,
            this.targetToken.displayedEntity!.width,
            this.targetToken.displayedEntity!.height,
        );
        this.overlayGraphics.fill({
            color: {
                r: 0,
                g: 0,
                b: 0,
                a: 0,
            },
        });

        this.addChild(this.overlayGraphics);

        const callback = (event: FederatedPointerEvent) => {
            let selectType: SelectTargetType = "selectTarget";
            if (this.arrow === undefined || this.arrow.destroyed) {
                this.drawArrow(event);
            } else {
                selectType = "attack";
            }

            selectTargetCallback(event, this.targetToken, selectType);
        };

        this.onClickCallback = callback;

        this.overlayGraphics.addEventListener(
            "pointerup",
            this.onClickCallback,
        );
    }

    public drawArrow(event: FederatedPointerEvent): void {
        this.arrow = new Arrow({
            token: this.initiatorToken,
            scene: this.initiatorToken.scene,
            eventMode: "none",
        });

        const localPos = event.getLocalPosition(
            this.initiatorToken.scene.viewport,
        );
        this.arrow.setTo(localPos);

        this.addChild(this.arrow);
    }

    public destroyArrow(): void {
        if (this.arrow !== undefined) {
            this.arrow.destroy(true);
        }
    }

    public destroy(options?: DestroyOptions): void {
        this.overlayGraphics.off("pointerup", this.onClickCallback);
        super.destroy(options);
    }
}
