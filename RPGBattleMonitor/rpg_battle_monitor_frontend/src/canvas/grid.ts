import {
    Application,
    Graphics,
    Point,
    RenderTexture,
    TilingSprite,
} from "pixi.js";

export class Grid extends TilingSprite {
    protected app: Application;

    protected gridGraphics: Graphics;

    constructor(app: Application) {
        super();

        console.log(this);
        this.app = app;
        this.gridGraphics = new Graphics();
        this.defaultGraphics();

        this.renderTexture();

        this.interactive = true;

        this.onpointermove = (event) => {
            console.log(event.getLocalPosition(this));
            console.log(this.getCellCoordinates(event.getLocalPosition(this)));
        };
    }

    public getCellCoordinates(point: Point): Point {
        return new Point(
            Math.floor(-(this.bounds.x - point.x) / 32),
            Math.floor(-(this.bounds.y - point.y) / 32),
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

        this.app.renderer.render({
            target: renderTexture,
            container: this.gridGraphics,
        });

        renderTexture.source.updateMipmaps();

        this.texture = renderTexture;
        this.width = this.app.canvas.width;
        this.height = this.app.canvas.height;

        this.tint = 0x303030;
    }
}
