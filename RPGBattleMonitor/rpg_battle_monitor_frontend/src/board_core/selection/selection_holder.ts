import { Container, Point } from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionOptions,
    Ghost,
} from "../extensions/container_extension";
import { GBoard } from "../board";
import { SelectionOutline } from "./selection_outline";

export class SelectionHolder extends ContainerExtension<Container> {
    public constructor(options?: ContainerExtensionOptions) {
        super(options);
    }

    protected createGhostContainer(): Ghost {
        this.children.forEach((c) => {
            if (
                c instanceof ContainerExtension &&
                !(c instanceof SelectionHolder)
            ) {
                c.createGhost();
            }
        });

        return new SelectionHolder(this);
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
            position.x = worldWidth - width + SelectionOutline.OUTLINE_OFFSET * 2;
        }

        const height = this.displayedEntity?.height ?? this.height;
        if (position.y + height > worldHeight) {
            position.y = worldHeight - height + SelectionOutline.OUTLINE_OFFSET * 2;
        }
    }
}
