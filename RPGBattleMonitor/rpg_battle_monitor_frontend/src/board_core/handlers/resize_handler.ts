import { Container, FederatedPointerEvent, Point } from "pixi.js";
import { ContainerExtension } from "../extensions/container_extension";
import { GSelectHandler } from "./select_handler";
import { GBoard } from "../board";
import { DragHandler } from "./drag_handler";

export enum ResizeKind {
    Top,
    TopRight,
    Right,
    BottomRight,
    Bottom,
    BottomLeft,
    Left,
    TopLeft,
}

type OnGlobalPointerMove = {
    handler: DragHandler;
    startPoint: Point;
    container: ContainerExtension;
};

class ResizeHandler {
    public registerResize(
        resizeDragPoint: Container,
        container: ContainerExtension,
        kind: ResizeKind,
    ) {
        const onPointerDown = (event: FederatedPointerEvent) => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }
            event.stopPropagation();

            if (
                container.isResizable === false ||
                container.isSelectable === false ||
                !GSelectHandler.isSelectionResizable()
            ) {
                return;
            }

            // console.log("start", event.getLocalPosition(GBoard.viewport));
            GBoard.viewport.on("globalmousemove", this.onGlobalPointerMove, {
                handler: this,
                startPoint: event.getLocalPosition(GBoard.viewport),
                container: container,
            });
        };

        const onPointerUp = () => {
            GBoard.viewport.off("globalmousemove", this.onGlobalPointerMove);
        };

        resizeDragPoint.on("pointerdown", onPointerDown);
        resizeDragPoint.on("pointerup", onPointerUp);
        resizeDragPoint.on("pointerupoutside", onPointerUp);
    }

    protected onGlobalPointerMove(
        this: OnGlobalPointerMove,
        event: FederatedPointerEvent,
    ) {
        const localPos = event.getLocalPosition(GBoard.viewport);
        const modifyWidthBy = localPos.x - this.startPoint.x;
        const modifyHeightBy = localPos.y - this.startPoint.y;

        const container = this.container.displayedEntity ?? this.container;
        const widthResult = container.width + modifyWidthBy;
        console.log("container width", container.width);
        console.log("final width", widthResult);
        if (widthResult < 10) {
            container.width = 10;
        } else {
            container.width = widthResult;
        }
    }
}

export const GResizeHandler = new ResizeHandler();
