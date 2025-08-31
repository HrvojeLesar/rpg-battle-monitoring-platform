import { Container, Point } from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionOptions,
    Ghost,
} from "../extensions/container_extension";
import { SelectionOutline } from "./selection_outline";
import { SelectHandler } from "../handlers/select_handler";
import { Grid } from "../grid/grid";
import { GBoard } from "../board";
import { IClampPositionToViewport } from "../interfaces/clamp_position_to_viewport";

export type SelectionHolder = InstanceType<typeof SelectionHolderInner>;

class SelectionHolderOutline extends SelectionOutline {
    protected drawOutline(): void {
        if (this.selectHandler.isMultiSelection()) {
            this.visible = true;
            this._outline
                .clear()
                .rect(
                    0,
                    0,
                    this._outlineAround.width,
                    this._outlineAround.height,
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

export class SelectionHolderContainer
    extends ContainerExtension
    implements IClampPositionToViewport
{
    protected _holder: SelectionHolderInner;
    protected outline: SelectionHolderOutline;

    public constructor(
        grid: Grid,
        selectHandler: SelectHandler,
        options?: ContainerExtensionOptions,
    ) {
        super(grid, options);

        this._holder = new SelectionHolderInner(selectHandler, options);
        this.outline = new SelectionHolderOutline(
            this._holder as any as ContainerExtension,
            selectHandler,
        );
        this.addChild(this._holder);
        this.addChild(this.outline);
    }

    public get holder(): SelectionHolderInner {
        return this._holder;
    }

    public clampPositionToViewport(
        newPosition: Point,
        selectHandler: SelectHandler,
    ): void {
        const worldWidth = GBoard.viewport.worldWidth;
        const worldHeight = GBoard.viewport.worldHeight;

        if (newPosition.x < 0) {
            newPosition.x = 0;
            selectHandler.setClampWidthLeft(true);
        } else {
            selectHandler.setClampWidthLeft(false);
        }

        if (newPosition.y < 0) {
            newPosition.y = 0;
            selectHandler.setClampHeightTop(true);
        } else {
            selectHandler.setClampHeightTop(false);
        }

        const width = this.width;
        if (newPosition.x + width > worldWidth) {
            newPosition.x =
                worldWidth - width + SelectionOutline.OUTLINE_POS_OFFSET;
            selectHandler.setClampWidthRight(true);
        } else {
            selectHandler.setClampWidthRight(false);
        }

        const height = this.height;
        if (newPosition.y + height > worldHeight) {
            newPosition.y =
                worldHeight - height + SelectionOutline.OUTLINE_POS_OFFSET;
            selectHandler.setClampHeightBottom(true);
        } else {
            selectHandler.setClampHeightBottom(false);
        }
    }

    protected createGhostContainer(): Ghost {
        throw new Error("Method should not be used");
    }
}

class SelectionHolderInner extends Container {
    protected selectHandler: SelectHandler;

    public constructor(
        selectHandler: SelectHandler,
        options?: ContainerExtensionOptions,
    ) {
        super(options);

        this.selectHandler = selectHandler;
    }
}
