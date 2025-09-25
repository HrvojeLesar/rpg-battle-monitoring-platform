import {
    Container,
    ContainerOptions,
    Cursor,
    DestroyOptions,
    Graphics,
    Point,
} from "pixi.js";
import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";
import { SelectHandler } from "../handlers/select_handler";
import { NEGATIVE_POINT } from "../utils/consts";
import { ResizeHandler, ResizeKind } from "../handlers/resize_handler";

const RESIZE_CONTROL_SIZE = 25;
const MAX_RESIZE_CONTROL_SIZE = 120;
const RESIZE_CONTROL_OFFSET = 8;

type PositionFuncs = {
    fn: (position: Point, width: number, height: number) => Point;
    kind: ResizeKind;
    cursor: Cursor;
};

class ResizeControls extends Container {
    private static readonly POSITION_FUNCS: PositionFuncs[] = [
        {
            fn: (position: Point, _width: number, _height: number): Point => {
                return new Point(
                    position.x - SelectionOutline.OUTLINE_OFFSET,
                    position.y - SelectionOutline.OUTLINE_OFFSET,
                );
            }, // Top left
            kind: ResizeKind.TopLeft,
            cursor: "nw-resize",
        },
        {
            fn: (position: Point, width: number, _height: number): Point => {
                return new Point(
                    position.x - SelectionOutline.OUTLINE_OFFSET + width / 2,
                    position.y - SelectionOutline.OUTLINE_OFFSET,
                );
            }, // Top
            kind: ResizeKind.Top,
            cursor: "n-resize",
        },
        {
            fn: (position: Point, width: number, _height: number): Point => {
                return new Point(
                    position.x - SelectionOutline.OUTLINE_OFFSET + width,
                    position.y - SelectionOutline.OUTLINE_OFFSET,
                );
            }, // Top right
            kind: ResizeKind.TopRight,
            cursor: "ne-resize",
        },
        {
            fn: (position: Point, width: number, height: number): Point => {
                return new Point(
                    position.x - SelectionOutline.OUTLINE_OFFSET + width,
                    position.y - SelectionOutline.OUTLINE_OFFSET + height / 2,
                );
            }, // Right
            kind: ResizeKind.Right,
            cursor: "e-resize",
        },
        {
            fn: (position: Point, width: number, height: number): Point => {
                return new Point(
                    position.x - SelectionOutline.OUTLINE_OFFSET + width,
                    position.y - SelectionOutline.OUTLINE_OFFSET + height,
                );
            }, // Bottom right
            kind: ResizeKind.BottomRight,
            cursor: "se-resize",
        },
        {
            fn: (position: Point, width: number, height: number): Point => {
                return new Point(
                    position.x - SelectionOutline.OUTLINE_OFFSET + width / 2,
                    position.y - SelectionOutline.OUTLINE_OFFSET + height,
                );
            }, // Bottom
            kind: ResizeKind.Bottom,
            cursor: "s-resize",
        },
        {
            fn: (position: Point, _width: number, height: number): Point => {
                return new Point(
                    position.x - SelectionOutline.OUTLINE_OFFSET,
                    position.y - SelectionOutline.OUTLINE_OFFSET + height,
                );
            }, // Bottom left
            kind: ResizeKind.BottomLeft,
            cursor: "sw-resize",
        },
        {
            fn: (position: Point, _width: number, height: number): Point => {
                return new Point(
                    position.x - SelectionOutline.OUTLINE_OFFSET,
                    position.y - SelectionOutline.OUTLINE_OFFSET + height / 2,
                );
            }, // Left
            kind: ResizeKind.Left,
            cursor: "w-resize",
        },
    ];

    protected _outlineContainer: ContainerExtension;
    protected _controlPoints: Graphics[];
    protected resizeHandler: ResizeHandler;
    protected selectHandler: SelectHandler;

    constructor(
        outlineContainer: ContainerExtension,
        resizeHandler: ResizeHandler,
        selectHandler: SelectHandler,
        options?: ContainerOptions,
    ) {
        super(options);

        this._outlineContainer = outlineContainer;
        this._controlPoints = [];
        this.resizeHandler = resizeHandler;
        this.selectHandler = selectHandler;

        this.registerResize();

        GBoard.app.ticker.add(this.tickerStroke, this);
    }

    private registerResize(): void {
        ResizeControls.POSITION_FUNCS.forEach((f) => {
            const controlPoint = new Graphics({
                eventMode: "static",
                cursor: f.cursor,
            });
            this._controlPoints.push(controlPoint);
            this.addChild(controlPoint);

            this.resizeHandler.registerResize(
                controlPoint,
                this._outlineContainer,
                f.kind,
            );
        });
    }

    private unregisterResize(): void {
        this.resizeHandler.unregisterResize(this._outlineContainer);
    }

    public destroy(options?: DestroyOptions): void {
        this.unregisterResize();
        GBoard.app.ticker.remove(this.tickerStroke, this);

        super.destroy(options);
    }

    // TODO: This function ticks constantly even when the outline is not visible
    protected tickerStroke(): void {
        if (this.selectHandler.isMultiSelection()) {
            this.visible = false;
            return;
        }

        if (!GBoard.scene) {
            return;
        }

        const scale = GBoard.scene.viewport.scale.x;
        const widthHeight = Math.max(
            Math.min(RESIZE_CONTROL_SIZE / scale - 15, MAX_RESIZE_CONTROL_SIZE),
            RESIZE_CONTROL_SIZE,
        );

        const positionModifier = RESIZE_CONTROL_OFFSET / scale;

        const outlineContainerLocalPos = this._outlineContainer
            .toLocal(GBoard.viewport)
            .multiply(NEGATIVE_POINT);

        ResizeControls.POSITION_FUNCS.forEach((f, idx) => {
            const controlPoint = this._controlPoints[idx];
            const position = f.fn(
                outlineContainerLocalPos,
                this._outlineContainer.width,
                this._outlineContainer.height,
            );
            controlPoint
                .clear()
                .rect(
                    position.x - positionModifier,
                    position.y - positionModifier,
                    widthHeight,
                    widthHeight,
                )
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
    protected selectHandler: SelectHandler;
    protected _resizeControls: ResizeControls;

    constructor(around: ContainerExtension, selectHandler: SelectHandler) {
        super();

        this._outlineAround = around;
        this.selectHandler = selectHandler;

        GBoard.app.ticker.add(this.tickerStroke, this);

        this._outline = new Graphics({ eventMode: "none" });
        this.addChild(this._outline);

        this._resizeControls = new ResizeControls(
            this._outlineAround,
            this.selectHandler.resizeHandler,
            this.selectHandler,
        );

        if (this._outlineAround.isResizable) {
            this.addChild(this._resizeControls);
        }
    }

    public destroy(options?: DestroyOptions): void {
        GBoard.app.ticker.remove(this.tickerStroke, this);

        this._resizeControls.destroy(options);
        super.destroy(options);
    }

    protected drawOutline(): void {
        if (!this._outlineAround.displayedEntity) {
            return;
        }

        const outlinePosition = this._outlineAround
            .toLocal(GBoard.viewport)
            .multiply(NEGATIVE_POINT);

        this._outline
            .clear()
            .rect(
                outlinePosition.x,
                outlinePosition.y,
                this._outlineAround.displayedEntity.width,
                this._outlineAround.displayedEntity.height,
            )
            .stroke({
                color: "red",
                width: 5,
            });
    }

    private tickerStroke(): void {
        this.drawOutline();
    }
}
