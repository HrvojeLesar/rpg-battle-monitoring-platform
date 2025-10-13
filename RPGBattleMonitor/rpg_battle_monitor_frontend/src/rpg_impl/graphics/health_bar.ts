import { Container, DestroyOptions, Graphics, Text, Ticker } from "pixi.js";
import { RpgToken } from "../tokens/rpg_token";
import { GBoard } from "@/board_core/board";

export const HEALTH_BAR_HEIGHT = 36;

class HealthBarBackground extends Container {
    public static RADIUS: number = 20;
    public token: RpgToken;
    public background: Graphics;
    public tempHitPointsBar: Graphics;
    public hitPointsBar: Graphics;

    public constructor(token: RpgToken) {
        super();

        this.token = token;
        this.background = new Graphics();
        this.hitPointsBar = new Graphics();
        this.tempHitPointsBar = new Graphics();

        this.addChild(
            this.background,
            this.hitPointsBar,
            this.tempHitPointsBar,
        );
    }

    protected drawBackground(): void {
        this.background.clear();
        this.background
            .roundRect(
                0,
                0,
                this.token.displayedEntity!.width,
                HEALTH_BAR_HEIGHT,
                HealthBarBackground.RADIUS,
            )
            .fill({
                color: "gray",
                alpha: 1,
            });
    }

    protected drawHitPointsBar(): void {
        const width = Math.min(
            this.token.displayedEntity!.width,
            this.token.displayedEntity!.width *
                (this.token.tokenData.hitPoints.current /
                    this.token.tokenData.hitPoints.maximum),
        );
        this.hitPointsBar.clear();
        this.hitPointsBar.roundRect(0, 0, width, HEALTH_BAR_HEIGHT).fill({
            color: "red",
            alpha: 1,
        });
    }

    protected drawTempHitPointsBar(): void {
        const width = Math.min(
            this.token.displayedEntity!.width,
            this.token.displayedEntity!.width *
                (this.token.tokenData.hitPoints.temporary /
                    this.token.tokenData.hitPoints.maximum),
        );
        this.tempHitPointsBar.clear();
        this.tempHitPointsBar.roundRect(0, 0, width, HEALTH_BAR_HEIGHT).fill({
            color: "blue",
            alpha: 1,
        });
    }

    public draw(): void {
        this.drawBackground();
        this.drawHitPointsBar();
        this.drawTempHitPointsBar();
    }
}

export class HealthBar extends Container {
    public token: RpgToken;
    public healthText: Text;
    public background: HealthBarBackground;

    public constructor(token: RpgToken) {
        super({
            eventMode: "static",
        });

        this.token = token;
        this.background = new HealthBarBackground(token);
        this.healthText = new Text({
            height: HEALTH_BAR_HEIGHT,
            text: this.healthLabel,
            resolution: 2,
            style: {
                fontSize: 120,
                fill: 0x000000,
            },
        });
        this.correctTextPosition();

        this.background.draw();

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
            this.correctTextPosition();
            this.healthText.width = this.tokenWidth;
            this.background.draw();
        }
    }

    protected correctTextPosition(): void {
        if (this.healthText.width > this.tokenWidth) {
            this.healthText.width = this.tokenWidth;
        }

        if (this.healthText.width < this.tokenWidth) {
            this.healthText.x = (this.tokenWidth - this.healthText.width) / 2;
        }
    }
}
