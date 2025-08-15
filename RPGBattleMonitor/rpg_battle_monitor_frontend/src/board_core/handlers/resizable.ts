import { Container, Point } from "pixi.js";
import { ResizeKind } from "./resize_handler";
import { GBoard } from "../board";

export const MIN_DIMENSION_PX = 50;

export function resize(
    container: Container,
    modifyContainer: Container,
    pointerPosition: Point,
    startPoint: Point,
    initialWidth: number,
    initialHeight: number,
    kind: ResizeKind,
) {
    const modifyX = pointerPosition.x - startPoint.x;
    const modifyY = pointerPosition.y - startPoint.y;

    if (kind === ResizeKind.Right) {
        const widthResult = Math.min(
            Math.max(initialWidth + modifyX, MIN_DIMENSION_PX),
            GBoard.viewport.worldWidth - container.x,
        );
        modifyContainer.width = widthResult;
    }

    if (kind === ResizeKind.Bottom) {
        const heightResult = Math.min(
            Math.max(initialHeight + modifyY, MIN_DIMENSION_PX),
            GBoard.viewport.worldHeight - container.y,
        );
        modifyContainer.height = heightResult;
    }

    if (kind === ResizeKind.Left) {
        const widthResult = Math.max(initialWidth - modifyX, MIN_DIMENSION_PX);
        const xResult = Math.max(
            Math.min(
                startPoint.x + modifyX,
                startPoint.x + initialWidth - MIN_DIMENSION_PX,
            ),
            0,
        );
        container.position.x = xResult;
        if (xResult > 0) {
            modifyContainer.width = widthResult;
        }
    }

    if (kind === ResizeKind.Top) {
        const heightResult = Math.min(
            Math.max(initialHeight - modifyY, MIN_DIMENSION_PX),
            GBoard.viewport.worldHeight - container.y,
        );
        const yResult = Math.max(
            Math.min(
                startPoint.y + modifyY,
                startPoint.y + initialHeight - MIN_DIMENSION_PX,
            ),
            0,
        );
        container.position.y = yResult;
        if (yResult > 0) {
            modifyContainer.height = heightResult;
        }
    }

    if (kind === ResizeKind.BottomRight) {
        const widthResult = Math.min(
            Math.max(initialWidth + modifyX, MIN_DIMENSION_PX),
            GBoard.viewport.worldWidth - container.x,
        );
        modifyContainer.width = widthResult;
        const heightResult = Math.min(
            Math.max(initialHeight + modifyY, MIN_DIMENSION_PX),
            GBoard.viewport.worldHeight - container.y,
        );
        modifyContainer.height = heightResult;
    }

    if (kind === ResizeKind.TopRight) {
        const heightResult = Math.min(
            Math.max(initialHeight - modifyY, MIN_DIMENSION_PX),
            GBoard.viewport.worldHeight - container.y,
        );
        const yResult = Math.max(
            Math.min(
                startPoint.y + modifyY,
                startPoint.y + initialHeight - MIN_DIMENSION_PX,
            ),
            0,
        );
        container.position.y = yResult;
        if (yResult > 0) {
            modifyContainer.height = heightResult;
        }
        const widthResult = Math.min(
            Math.max(initialWidth + modifyX, MIN_DIMENSION_PX),
            GBoard.viewport.worldWidth - container.x,
        );
        modifyContainer.width = widthResult;
    }

    if (kind === ResizeKind.BottomLeft) {
        const heightResult = Math.min(
            Math.max(initialHeight + modifyY, MIN_DIMENSION_PX),
            GBoard.viewport.worldHeight - container.y,
        );
        modifyContainer.height = heightResult;
        const widthResult = Math.min(
            Math.max(initialWidth - modifyX, MIN_DIMENSION_PX),
            GBoard.viewport.worldWidth - container.x,
        );
        const xResult = Math.max(
            Math.min(
                startPoint.x + modifyX,
                startPoint.x + initialWidth - MIN_DIMENSION_PX,
            ),
            0,
        );
        container.position.x = xResult;
        if (xResult > 0) {
            modifyContainer.width = widthResult;
        }
    }

    if (kind === ResizeKind.TopLeft) {
        const widthResult = Math.max(initialWidth - modifyX, MIN_DIMENSION_PX);
        const xResult = Math.max(
            Math.min(
                startPoint.x + modifyX,
                startPoint.x + initialWidth - MIN_DIMENSION_PX,
            ),
            0,
        );
        container.position.x = xResult;
        if (xResult > 0) {
            modifyContainer.width = widthResult;
        }
        const heightResult = Math.min(
            Math.max(initialHeight - modifyY, MIN_DIMENSION_PX),
            GBoard.viewport.worldHeight - container.y,
        );
        const yResult = Math.max(
            Math.min(
                startPoint.y + modifyY,
                startPoint.y + initialHeight - MIN_DIMENSION_PX,
            ),
            0,
        );
        container.position.y = yResult;
        if (yResult > 0) {
            modifyContainer.height = heightResult;
        }
    }
}
