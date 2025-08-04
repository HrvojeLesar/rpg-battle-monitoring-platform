import { Container, Point } from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionOptions,
    Ghost,
} from "../extensions/container_extension";
import { GBoard } from "../board";
import { SelectionOutline } from "./selection_outline";
import { GSelectHandler } from "../handlers/select_handler";

export class SelectionHolder extends ContainerExtension<Container> {
    public constructor(options?: ContainerExtensionOptions) {
        super(options);
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
                worldWidth - width + SelectionOutline.OUTLINE_OFFSET * 2;
        }

        const height = this.displayedEntity?.height ?? this.height;
        if (position.y + height > worldHeight) {
            position.y =
                worldHeight - height + SelectionOutline.OUTLINE_OFFSET * 2;
        }
    }

    protected addGhostToStage(ghost: Ghost): void {
        GBoard.viewport.addChildAt(ghost, GBoard.viewport.getChildIndex(this));
    }
}
