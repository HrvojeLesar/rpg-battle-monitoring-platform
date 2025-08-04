import { Container, ContainerChild, IRenderLayer, Point } from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionOptions,
    Ghost,
} from "../extensions/container_extension";
import { GBoard } from "../board";
import { SelectionOutline } from "./selection_outline";
import { GSelectHandler } from "../handlers/select_handler";

class SelectionHolderOutline extends SelectionOutline {
    protected tickerStroke(): void {
        if (GSelectHandler.isMultiSelection()) {
            this.visible = true;
            this._outline
                .clear()
                .rect(
                    -SelectionOutline.OUTLINE_OFFSET,
                    -SelectionOutline.OUTLINE_OFFSET,
                    this._outlineAround.width,
                    this._outlineAround.height,
                )
                .stroke({
                    color: "blue",
                    width: 3,
                });
        } else {
            this.visible = false;
        }
    }
}

export class SelectionHolder extends ContainerExtension<Container> {
    public constructor(options?: ContainerExtensionOptions) {
        super(options);

        this.removeChild(this._selectionOutline);
        this._selectionOutline.destroy();

        this._selectionOutline = new SelectionHolderOutline(this);
        this.addChild(this._selectionOutline);
    }

    protected createGhostContainer(): Ghost {
        const children = [...this.children];
        GSelectHandler.deselectGroup();

        children.forEach((c) => {
            if (
                c instanceof ContainerExtension &&
                !(c instanceof SelectionHolder)
            ) {
                const ghost = c.createGhost();
                this.addGhostToStage(ghost);
            }
        });
        GSelectHandler.selectGroup();

        return new SelectionHolder();
    }

    public clearGhosts(): void {
        this.children.forEach((c) => {
            if (
                c instanceof ContainerExtension &&
                !(c instanceof SelectionHolder)
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

    public addChild<U extends (ContainerChild | IRenderLayer)[]>(
        ...children: U
    ): U[0] {
        const child = super.addChild(...children);

        // Keeps outline on top
        super.addChild(this._selectionOutline);

        return child;
    }

    protected addGhostToStage(ghost: Ghost): void {
        GBoard.viewport.addChildAt(ghost, GBoard.viewport.getChildIndex(this));
    }
}
