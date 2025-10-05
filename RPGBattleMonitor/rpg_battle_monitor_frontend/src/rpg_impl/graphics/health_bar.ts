import {
    ColorSource,
    Container,
    DestroyOptions,
    Graphics,
    Text,
    Ticker,
} from "pixi.js";
import { RpgToken } from "../tokens/rpg_token";
import { GBoard } from "@/board_core/board";

export const HEALTH_BAR_HEIGHT = 36;

export class HealthBar extends Container {
    public token: RpgToken;
    public healthText: Text;
    public background: Graphics;

    public constructor(token: RpgToken) {
        super({
            eventMode: "static",
        });

        this.token = token;
        this.background = new Graphics();
        this.healthText = new Text({
            width: this.tokenWidth,
            height: HEALTH_BAR_HEIGHT,
            text: this.healthLabel,
            resolution: 2,
            style: {
                fontSize: 24 / this.token.scene.viewport.scale.x,
                fill: 0x000000,
            },
        });

        this.drawBackground();

        this.addChild(this.background, this.healthText);

        this.y = -HEALTH_BAR_HEIGHT - 10;

        GBoard.app.ticker.add(this.updateDisplay, this);
    }

    public destroy(options?: DestroyOptions): void {
        GBoard.app.ticker.remove(this.updateDisplay, this);

        super.destroy(options);
    }

    protected get healthLabel(): string {
        return `${this.token.tokenData.hitPoints.current}${this.token.tokenData.hitPoints.temporary > 0 ? `+${this.token.tokenData.hitPoints.temporary}` : ""}/${this.token.tokenData.hitPoints.maximum}`;
    }

    protected drawBackground(color?: ColorSource): void {
        this.background.clear();
        this.background
            .roundRect(
                0,
                0,
                this.token.displayedEntity!.width,
                HEALTH_BAR_HEIGHT,
                20,
            )
            .fill({
                color: color ?? 0xffff00,
                alpha: 1,
            });
    }

    protected get tokenWidth(): number {
        return this.token.displayedEntity!.width;
    }

    protected get tokenHeight(): number {
        return this.token.displayedEntity!.height;
    }

    protected updateDisplay(_ticker: Ticker): void {
        if (
            this.healthText.text !== this.healthLabel ||
            this.token.displayedEntity!.width !== this.background.width
        ) {
            this.healthText.text = this.healthLabel;
            this.healthText.width = this.tokenWidth;
            this.drawBackground();
        }
    }
}
