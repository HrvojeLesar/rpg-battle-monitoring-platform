import {
    Container,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    Ticker,
} from "pixi.js";
import { RpgToken } from "../tokens/rpg_token";
import { GBoard } from "@/board_core/board";

export type DistanceDisplayOptions = {
    token: RpgToken;
} & ContainerOptions;

export class OnTurnMarker extends Container {
    public token: RpgToken;
    public background: Graphics;

    protected elapsed: number = 0;
    protected amplitude: number = 10;
    protected speed: number = 0.05;
    protected offset: number = -100;

    public constructor(options: DistanceDisplayOptions) {
        super({
            ...options,
            eventMode: "none",
        });

        this.token = options.token;
        this.token.addChild(this);

        this.background = new Graphics();
        this.drawBackground();

        this.addChild(this.background);

        // TODO: Position so text length is offset and text does not go to the right of token
        this.position.set(this.token.displayedEntity!.width / 2, this.offset);

        GBoard.app.ticker.add(this.bobUpAndDown, this);
    }

    protected drawBackground(): void {
        this.background.clear();
        this.background.circle(0, 0, 20).fill({ color: "gray" });
        this.background.circle(0, 0, 10).fill({ color: "black", alpha: 0.9 });
        this.background
            .moveTo(-15, 10)
            .lineTo(15, 10)
            .lineTo(0, 45)
            .lineTo(-15, 10)
            .fill({ color: "gray", width: 5 })
            .closePath()
            .stroke({ color: "gray", width: 5 });
    }

    public destroy(options?: DestroyOptions): void {
        GBoard.app.ticker.remove(this.bobUpAndDown, this);
        super.destroy(options);
    }

    protected bobUpAndDown(ticker: Ticker): void {
        const deltaTime = ticker.deltaTime;

        this.elapsed += deltaTime;
        this.position.y =
            this.amplitude * Math.sin(this.elapsed * this.speed) + this.offset;
    }

    public set visible(value: boolean) {
        GBoard.app.ticker.remove(this.bobUpAndDown, this);
        super.visible = value;

        if (value) {
            GBoard.app.ticker.add(this.bobUpAndDown, this);
        }
    }
}
