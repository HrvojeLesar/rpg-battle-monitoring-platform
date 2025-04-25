import {
    Application,
    Container,
    Graphics,
    Point,
    RenderTexture,
    TilingSprite,
} from "pixi.js";

export class Grid extends Container {
    protected app: Application;

    protected gridSprite: GridSprite;

    protected hoveredCell: Graphics | undefined;

    private hover: boolean = true;

    constructor(app: Application, options?: { hover?: boolean }) {
        super();

        this.hover = options?.hover ?? this.hover;

        this.app = app;
        this.gridSprite = new GridSprite(this.app);
        this.interactive = true;

        this.hoveredCell = this.initHoveredCell();

        this.initEvents();

        this.addChild(this.gridSprite);
        if (this.hoveredCell) {
            this.addChild(this.hoveredCell);
        }
    }

    protected initEvents() {
        this.onpointermove = (event) => {
            const localPosition = event.getLocalPosition(this);
            const cellPosition = this.getCellCoordinates(localPosition);

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

    private getCellCoordinates(point: Point): Point {
        return new Point(
            Math.floor(-(this.gridSprite.bounds.x - point.x) / 32),
            Math.floor(-(this.gridSprite.bounds.y - point.y) / 32),
        );
    }

    private initHoveredCell() {
        if (!this.hover) {
            return undefined;
        }

        this.hoveredCell = new Graphics();
        this.hoveredCell.rect(0, 0, 32, 32).fill({ color: "red" });
        this.hoveredCell.visible = true;

        return this.hoveredCell;
    }
}

export class GridSprite extends TilingSprite {
    protected app: Application;

    protected gridGraphics: Graphics;

    constructor(app: Application) {
        super();

        this.app = app;
        this.interactive = true;
        this.gridGraphics = new Graphics();
        this.defaultGraphics();
        this.renderTexture();
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
}
