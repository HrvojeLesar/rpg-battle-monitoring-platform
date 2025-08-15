import { Container, Point } from "pixi.js";
import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";
import { SelectHandler } from "../handlers/select_handler";
import { SelectionHolderContainer } from "../selection/selection_holder";
import { IClampPositionToViewport } from "../interfaces/clamp_position_to_viewport";

export class ContainerExtensionClamp implements IClampPositionToViewport {
    public clampPositionToViewport(
        container: ContainerExtension,
        newPosition: Point,
        selectHandler?: any,
    ): void {
        const worldWidth = GBoard.viewport.worldWidth;
        const worldHeight = GBoard.viewport.worldHeight;

        if (newPosition.x < 0) {
            newPosition.x = 0;
        }

        if (newPosition.y < 0) {
            newPosition.y = 0;
        }

        const width = container.displayedEntity?.width ?? container.width;
        if (newPosition.x + width > worldWidth) {
            newPosition.x = worldWidth - width;
        }

        const height = container.displayedEntity?.height ?? container.height;
        if (newPosition.y + height > worldHeight) {
            newPosition.y = worldHeight - height;
        }

        if (selectHandler instanceof SelectHandler) {
            if (
                selectHandler.getClampWidthLeft() ||
                selectHandler.getClampWidthRight()
            ) {
                newPosition.x = container.x;
            }

            if (
                selectHandler.getClampHeightTop() ||
                selectHandler.getClampHeightBottom()
            ) {
                newPosition.y = container.y;
            }
        }
    }

    public supports(container: Container): boolean {
        if (
            container instanceof ContainerExtension &&
            !(container instanceof SelectionHolderContainer)
        ) {
            return true;
        }

        return false;
    }
}
