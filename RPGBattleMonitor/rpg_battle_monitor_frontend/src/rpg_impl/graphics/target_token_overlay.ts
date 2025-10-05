import {
    Container,
    DestroyOptions,
    FederatedPointerEvent,
    Graphics,
} from "pixi.js";
import { RpgToken } from "../tokens/rpg_token";

export class TargetTokenOverlay extends Container {
    public token: RpgToken;
    public overlayGraphics: Graphics;
    public onClickCallback: (event: FederatedPointerEvent) => void;

    public constructor(
        token: RpgToken,
        selectTargetCallback: (
            event: FederatedPointerEvent,
            token: RpgToken,
        ) => void,
    ) {
        super({
            eventMode: "static",
        });

        this.token = token;

        this.overlayGraphics = new Graphics({
            eventMode: "static",
            cursor: "pointer",
        });
        this.overlayGraphics.rect(
            this.token.position.x,
            this.token.position.y,
            this.token.displayedEntity!.width,
            this.token.displayedEntity!.height,
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
            selectTargetCallback(event, this.token);
        };

        this.onClickCallback = callback;

        this.overlayGraphics.addEventListener("pointerup", this.onClickCallback);
    }

    public destroy(options?: DestroyOptions): void {
        this.overlayGraphics.off("pointerup", this.onClickCallback);
        super.destroy(options);
    }
}
