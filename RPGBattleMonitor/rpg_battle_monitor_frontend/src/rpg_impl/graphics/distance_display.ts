import { Container, ContainerOptions, Graphics, Text } from "pixi.js";
import { RpgToken } from "../tokens/rpg_token";

export type DistanceDisplayOptions = {
    token: RpgToken;
} & ContainerOptions;

export class DistanceDisplay extends Container {
    public token: RpgToken;
    public textLabel: Text;
    public background: Graphics;
    public units = "ft";
    protected _distance = 0;

    constructor(options: DistanceDisplayOptions) {
        super(options);

        this.token = options.token;
        this.token.addChild(this);

        this.textLabel = new Text({
            text: this.distanceText,
            resolution: 2,
            style: {
                fontSize: 24 / this.token.scene.viewport.scale.x,
                fill: 0x000000,
            },
            anchor: 0.5,
        });

        this.background = new Graphics();
        this.drawBackground();

        this.addChild(this.background, this.textLabel);

        // TODO: Position so text length is offset and text does not go to the right of token
        this.position.set(
            this.token.displayedEntity!.width / 2,
            this.token.displayedEntity!.height + 150,
        );
        this.visible = false;
    }

    protected setText(text: string): void {
        this.textLabel.text = text;
        this.drawBackground();
    }

    protected drawBackground(): void {
        const padding = 10;

        this.background.clear();
        this.background
            .roundRect(
                -this.textLabel.width / 2 - padding,
                -this.textLabel.height / 2 - padding,
                this.textLabel.width + padding * 2,
                this.textLabel.height + padding * 2,
                20,
            )
            .fill({
                color: 0xffff00,
                alpha: 1,
            });
    }

    protected get distanceText(): string {
        return `${this._distance} ${this.units}`;
    }

    public get distance(): number {
        return this._distance;
    }

    public set distance(value: number) {
        this._distance = value;
        this.setText(this.distanceText);
    }
}
