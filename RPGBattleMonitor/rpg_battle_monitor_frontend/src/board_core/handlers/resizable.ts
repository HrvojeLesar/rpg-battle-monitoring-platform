import { Container, ObservablePoint, Point } from "pixi.js";
import { ResizeKind } from "./resize_handler";

export interface IResizable {
    getInitialPosition(): ObservablePoint;
    getInitialHeight(): number;
    getInitialWidth(): number;
    resize(
        pointerPosition: Point,
        startPoint: Point,
        initialWidth: number,
        initialHeight: number,
        kind: ResizeKind,
    ): void;
}

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
        const widthResult = initialWidth + modifyX;
        modifyContainer.width = widthResult;
    }

    if (kind === ResizeKind.Bottom) {
        const heightResult = initialHeight + modifyY;
        modifyContainer.height = heightResult;
    }

    if (kind === ResizeKind.Left) {
        const widthResult = initialWidth - modifyX;
        container.position.x = modifyX;
        modifyContainer.width = widthResult;
    }

    if (kind === ResizeKind.Top) {
        const heightResult = initialHeight - modifyY;
        container.position.y = modifyY;
        modifyContainer.height = heightResult;
    }

    if (kind === ResizeKind.BottomRight) {
        const widthResult = initialWidth + modifyX;
        modifyContainer.width = widthResult;
        const heightResult = initialHeight + modifyY;
        modifyContainer.height = heightResult;
    }

    if (kind === ResizeKind.TopRight) {
        const heightResult = initialHeight - modifyY;
        container.position.y = modifyY;
        modifyContainer.height = heightResult;
        const widthResult = initialWidth + modifyX;
        modifyContainer.width = widthResult;
    }

    if (kind === ResizeKind.BottomLeft) {
        const heightResult = initialHeight + modifyY;
        modifyContainer.height = heightResult;
        const widthResult = initialWidth - modifyX;
        container.position.x = modifyX;
        modifyContainer.width = widthResult;
    }

    if (kind === ResizeKind.TopLeft) {
        const widthResult = initialWidth - modifyX;
        container.position.x = modifyX;
        modifyContainer.width = widthResult;
        const heightResult = initialHeight - modifyY;
        container.position.y = modifyY;
        modifyContainer.height = heightResult;
    }
}
