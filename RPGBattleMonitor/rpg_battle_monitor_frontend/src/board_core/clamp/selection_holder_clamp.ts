import { Container, Point } from "pixi.js";
import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";
import { SelectionOutline } from "../selection/selection_outline";
import { SelectionHolderContainer } from "../selection/selection_holder";
import { SelectHandler } from "../handlers/select_handler";
import { IClampPositionToViewport } from "../interfaces/clamp_position_to_viewport";

export class SelectionHolderClamp implements IClampPositionToViewport {
    public clampPositionToViewport(
        container: ContainerExtension,
        newPosition: Point,
        selectHandler?: SelectHandler | undefined,
    ): void {
        const worldWidth = GBoard.viewport.worldWidth;
        const worldHeight = GBoard.viewport.worldHeight;

        if (!(selectHandler instanceof SelectHandler)) {
            selectHandler = undefined;
        }

        if (newPosition.x < 0) {
            newPosition.x = 0;
            selectHandler?.setClampWidthLeft(true);
        } else {
            selectHandler?.setClampWidthLeft(false);
        }

        if (newPosition.y < 0) {
            newPosition.y = 0;
            selectHandler?.setClampHeightTop(true);
        } else {
            selectHandler?.setClampHeightTop(false);
        }

        const width = container.width;
        if (newPosition.x + width > worldWidth) {
            newPosition.x =
                worldWidth - width + SelectionOutline.OUTLINE_POS_OFFSET;
            selectHandler?.setClampWidthRight(true);
        } else {
            selectHandler?.setClampWidthRight(false);
        }

        const height = container.height;
        if (newPosition.y + height > worldHeight) {
            newPosition.y =
                worldHeight - height + SelectionOutline.OUTLINE_POS_OFFSET;
            selectHandler?.setClampHeightBottom(true);
        } else {
            selectHandler?.setClampHeightBottom(false);
        }
    }

    public supports(container: Container): boolean {
        if (container instanceof SelectionHolderContainer) {
            return true;
        }

        return false;
    }
}
