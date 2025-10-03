import {
    ColorSource,
    Container,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    Ticker,
} from "pixi.js";
import { RpgToken } from "../tokens/rpg_token";
import { GBoard } from "@/board_core/board";

export type InRangeHighlightOptions = {
    token: RpgToken;
} & ContainerOptions;

export class InRangeHighlight extends Container {
    public token: RpgToken;
    public outline: Graphics;
    protected elapsed: number = 0;
    protected speed: number = 0.01 / 2;

    public constructor(options: InRangeHighlightOptions) {
        super(options);

        this.token = options.token;

        this.outline = new Graphics();
        this.addChild(this.outline);

        GBoard.app.ticker.add(this.drawOutline, this);
    }

    public destroy(options?: DestroyOptions): void {
        GBoard.app.ticker.remove(this.drawOutline, this);
        super.destroy(options);
    }

    public get visible(): boolean {
        return super.visible;
    }

    public set visible(value: boolean) {
        GBoard.app.ticker.remove(this.drawOutline, this);

        if (value) {
            GBoard.app.ticker.add(this.drawOutline, this);
        }

        super.visible = value;
    }

    protected drawOutline(ticker: Ticker): void {
        this.elapsed += ticker.elapsedMS;
        const alphaValue = 0.5 * Math.sin(this.elapsed * this.speed) + 0.5;
        this.outline.clear();
        this.outline
            .rect(
                0,
                0,
                this.token.displayedEntity!.width,
                this.token.displayedEntity!.height,
            )
            .stroke({
                color: this.getHostileColour(alphaValue),
                // color: this.getFriendlyColour(alphaValue),
                width: 5 + 5 / this.token.scene.viewport.scale.x,
            });
    }

    protected getFriendlyColour(alphaValue: number): ColorSource {
        return {
            r: 0,
            g: 240,
            b: 0,
            a: alphaValue,
        };
    }

    protected getHostileColour(alphaValue: number): ColorSource {
        return {
            r: 240,
            g: 0,
            b: 0,
            a: alphaValue,
        };
    }
}
