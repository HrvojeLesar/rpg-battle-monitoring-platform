import { Container, Point } from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionOptions,
    Ghost,
} from "../extensions/container_extension";
import { GBoard } from "../board";
import { SelectionOutline } from "./selection_outline";
import { SelectHandler } from "../handlers/select_handler";
import { NEGATIVE_POINT } from "../utils/consts";

export type SelectionHolder = InstanceType<typeof SelectionHolderInner>;

class SelectionHolderOutline extends SelectionOutline {
    protected drawOutline(): void {
        const outlinePosition = this._outlineAround
            .toLocal(GBoard.viewport)
            .multiply(NEGATIVE_POINT);

        if (this.selectHandler.isMultiSelection()) {
            this.visible = true;
            this._outline
                .clear()
                .rect(
                    outlinePosition.x,
                    outlinePosition.y,
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

export class SelectionHolderContainer extends Container {
    protected _holder: SelectionHolderInner;
    protected outline: SelectionHolderOutline;

    public constructor(
        selectHandler: SelectHandler,
        options?: ContainerExtensionOptions,
    ) {
        super(options);

        this._holder = new SelectionHolderInner(selectHandler, options);
        this.outline = new SelectionHolderOutline(this._holder, selectHandler);
        this.addChild(this._holder);
        this.addChild(this.outline);
    }

    public get holder(): SelectionHolderInner {
        return this._holder;
    }
}

class SelectionHolderInner extends ContainerExtension<Container> {
    protected selectHandler: SelectHandler;

    public constructor(
        selectHandler: SelectHandler,
        options?: ContainerExtensionOptions,
    ) {
        super(options);

        this.selectHandler = selectHandler;
    }

    protected createGhostContainer(): Ghost {
        const children = [...this.children];
        this.selectHandler.deselectGroup();

        children.forEach((c) => {
            if (
                c instanceof ContainerExtension &&
                !(c instanceof SelectionHolderInner)
            ) {
                const ghost = c.createGhost();
                this.addGhostToStage(ghost);
            }
        });
        this.selectHandler.selectGroup();

        return new SelectionHolderInner(this.selectHandler);
    }

    public clearGhosts(): void {
        this.children.forEach((c) => {
            if (
                c instanceof ContainerExtension &&
                !(c instanceof SelectionHolderInner)
            ) {
                c.clearGhosts();
            }
        });

        const ghosts = this._ghots.clear();

        for (const ghost of ghosts) {
            this.removeGhostFromStage(ghost);
            ghost.destroy();
        }
    }

    public clampPositionToViewport(position: Point) {
        const worldWidth = GBoard.viewport.worldWidth;
        const worldHeight = GBoard.viewport.worldHeight;

        if (position.x < 0) {
            position.x = 0;
        }

        if (position.y < 0) {
            position.y = 0;
        }

        const width = this.displayedEntity?.width ?? this.width;
        if (position.x + width > worldWidth) {
            position.x =
                worldWidth - width + SelectionOutline.OUTLINE_POS_OFFSET;
        }

        const height = this.displayedEntity?.height ?? this.height;
        if (position.y + height > worldHeight) {
            position.y =
                worldHeight - height + SelectionOutline.OUTLINE_POS_OFFSET;
        }
    }

    protected addGhostToStage(ghost: Ghost): void {
        GBoard.viewport.addChildAt(ghost, GBoard.viewport.getChildIndex(this));
    }
}
