import {
    Application,
    Graphics,
    Point,
    RenderTexture,
    TilingSprite,
} from "pixi.js";
import { isDev } from "../utils/devMode";

export class Grid extends TilingSprite {
    protected app: Application;

    protected gridGraphics: Graphics;

    protected hoveredCell: Graphics | undefined;

    constructor(
        app: Application,
        options: { hover?: boolean } = { hover: true },
    ) {
        super();

        this.app = app;
        this.interactive = true;
        this.gridGraphics = new Graphics();
        this.defaultGraphics();
        this.renderTexture();

        console.log(options);

        if (options.hover) {
            this.initHoveredCell();
        }

        this.onpointermove = (event) => {
            const localPosition = event.getLocalPosition(this);
            const cellPosition = this.getCellCoordinates(localPosition);
            if (isDev()) {
                console.log("Local position", localPosition);
                console.log("Cell coordinates", cellPosition);
            }

            if (this.hoveredCell) {
                this.hoveredCell.x = cellPosition.x * 32;
                this.hoveredCell.y = cellPosition.y * 32;
            }
        };

        this.onpointerenter = (_event) => {
            if (this.hoveredCell) {
                this.hoveredCell.visible = true;
            }
        };

        this.onpointerleave = (_event) => {
            if (this.hoveredCell) {
                this.hoveredCell.visible = false;
            }
        };
    }

    public getCellCoordinates(point: Point): Point {
        return new Point(
            Math.floor(-(this.bounds.x - point.x) / 32),
            Math.floor(-(this.bounds.y - point.y) / 32),
        );
    }

    protected defaultGraphics() {
        this.gridGraphics.rect(0, 0, 31, 31).stroke({ color: 0xffffff });
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
    }

    private initHoveredCell() {
        this.hoveredCell = new Graphics();
        this.hoveredCell.rect(0, 0, 32, 32).fill({ color: "red" });
        this.hoveredCell.visible = true;
        this.addChild(this.hoveredCell);
    }
}
