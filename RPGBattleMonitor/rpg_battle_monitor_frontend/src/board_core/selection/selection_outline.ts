import {
    Container,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    Point,
} from "pixi.js";
import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";
import { GSelectHandler } from "../handlers/select_handler";

class ResizeControls extends Container {
    private static readonly POSITION_FUNCS = [
        (position: Point, _width: number, _height: number): Point => {
            return new Point(
                position.x - SelectionOutline.OUTLINE_OFFSET,
                position.y - SelectionOutline.OUTLINE_OFFSET,
            );
        }, // Top left
        (position: Point, width: number, _height: number): Point => {
            return new Point(
                position.x - SelectionOutline.OUTLINE_OFFSET + width / 2,
                position.y - SelectionOutline.OUTLINE_OFFSET,
            );
        }, // Top
        (position: Point, width: number, _height: number): Point => {
            return new Point(
                position.x - SelectionOutline.OUTLINE_OFFSET + width,
                position.y - SelectionOutline.OUTLINE_OFFSET,
            );
        }, // Top right
        (position: Point, width: number, height: number): Point => {
            return new Point(
                position.x - SelectionOutline.OUTLINE_OFFSET + width,
                position.y - SelectionOutline.OUTLINE_OFFSET + height / 2,
            );
        }, // Right
        (position: Point, width: number, height: number): Point => {
            return new Point(
                position.x - SelectionOutline.OUTLINE_OFFSET + width,
                position.y - SelectionOutline.OUTLINE_OFFSET + height,
            );
        }, // Bottom right
        (position: Point, width: number, height: number): Point => {
            return new Point(
                position.x - SelectionOutline.OUTLINE_OFFSET + width / 2,
                position.y - SelectionOutline.OUTLINE_OFFSET + height,
            );
        }, // Bottom
        (position: Point, _width: number, height: number): Point => {
            return new Point(
                position.x - SelectionOutline.OUTLINE_OFFSET,
                position.y - SelectionOutline.OUTLINE_OFFSET + height,
            );
        }, // Bottom left
        (position: Point, _width: number, height: number): Point => {
            return new Point(
                position.x - SelectionOutline.OUTLINE_OFFSET,
                position.y - SelectionOutline.OUTLINE_OFFSET + height / 2,
            );
        }, // Left
    ];
    protected _outlineContainer: ContainerExtension;
    protected _controlPoints: Graphics[];

    constructor(
        outlineContainer: ContainerExtension,
        options?: ContainerOptions,
    ) {
        super(options);

        this._outlineContainer = outlineContainer;
        this._controlPoints = [];

        ResizeControls.POSITION_FUNCS.forEach(() => {
            const controlPoint = new Graphics();
            this._controlPoints.push(controlPoint);
            this.addChild(controlPoint);
        });

        GBoard.app.ticker.add(this.tickerStroke, this);
    }

    public destroy(options?: DestroyOptions): void {
        GBoard.app.ticker.remove(this.tickerStroke, this);

        super.destroy(options);
    }

    protected tickerStroke(): void {
        const outlineContainerLocalPos = GBoard.viewport.toLocal(
            this._outlineContainer,
        );

        ResizeControls.POSITION_FUNCS.forEach((pos, idx) => {
            const controlPoint = this._controlPoints[idx];
            const position = pos(
                outlineContainerLocalPos,
                this._outlineContainer.width,
                this._outlineContainer.height,
            );
            controlPoint
                .clear()
                .rect(position.x, position.y, 10, 10)
                .fill({ color: "white" })
                .stroke();
        });
    }
}

export class SelectionOutline extends Container {
    public static readonly OUTLINE_OFFSET: Readonly<number> = 5;
    public static readonly OUTLINE_POS_OFFSET: Readonly<number> =
        SelectionOutline.OUTLINE_OFFSET * 2;
    protected _outlineAround: ContainerExtension;
    protected _outline: Graphics;
    // protected _resizeControls: ResizeControls;

    constructor(around: ContainerExtension) {
        super();

        this.visible = false;
        this._outlineAround = around;

        GBoard.app.ticker.add(this.tickerStroke, this);

        this._outline = new Graphics();
        this.addChild(this._outline);

        // this._resizeControls = new ResizeControls(this._outlineAround);
        // this.addChild(this._resizeControls);
    }

    public destroy(options?: DestroyOptions): void {
        GBoard.app.ticker.remove(this.tickerStroke, this);

        super.destroy(options);
    }

    protected tickerStroke(): void {
        if (!this._outlineAround.displayedEntity) {
            return;
        }

        if (GSelectHandler.isSelected(this._outlineAround)) {
            this.visible = true;
            this._outline
                .clear()
                .rect(
                    0,
                    0,
                    this._outlineAround.displayedEntity.width,
                    this._outlineAround.displayedEntity.height,
                )
                .stroke({
                    color: "red",
                    width: 5,
                });
        } else {
            this.visible = false;
        }
    }
}
