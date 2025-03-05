import { Graphics, Point, RenderTexture, TilingSprite } from "pixi.js";
import G from "../globals";

export class Grid extends TilingSprite {
    protected gridGraphics: Graphics;

    constructor() {
        super();

        this.gridGraphics = new Graphics();
        this.defaultGraphics();

        this.renderTexture();

        this.interactive = true;

        this.onpointermove = (event) => {
            console.log("pointer move");
            console.log(event.getLocalPosition(this));
            console.log(this.getCellCoordinates(event.getLocalPosition(this)));
        };
    }

    public getCellCoordinates(point: Point): Point {
        console.log(point.x);
        console.log(this.bounds.x);
        console.log(this.bounds.x - point.x);

        return new Point(
            Math.floor((this.bounds.x - point.x) / 32),
            Math.floor((this.bounds.y - point.y) / 32),
        );
    }

    protected defaultGraphics() {
        this.gridGraphics
            .rect(0, 0, 32, 32)
            .fill(0x808080)
            .rect(1, 1, 31, 31)
            .fill(0xffffff);
    }

    protected renderTexture() {
        const renderTexture = RenderTexture.create({
            width: this.gridGraphics.width,
            height: this.gridGraphics.height,
            autoGenerateMipmaps: true,
        });

        G.app.renderer.render({
            target: renderTexture,
            container: this.gridGraphics,
        });

        renderTexture.source.updateMipmaps();

        this.texture = renderTexture;
        this.width = 32 * 32 * 32;
        this.height = 32 * 32 * 32;

        this.anchor.set(0.5, 0.5);

        this.tint = 0x303030;
    }
}
