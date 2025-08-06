import { Container, FederatedPointerEvent, Point } from "pixi.js";
import { ContainerExtension } from "../extensions/container_extension";
import { GBoard } from "../board";
import { DragHandler } from "./drag_handler";
import { SelectHandler } from "./select_handler";
import { Scene } from "../scene";

export enum ResizeKind {
    TopLeft = "top-left",
    Top = "top",
    TopRight = "top-right",
    Right = "right",
    BottomRight = "bottom-right",
    Bottom = "bottom",
    BottomLeft = "bottom-left",
    Left = "left",
}

type OnGlobalPointerMove = {
    handler: DragHandler;
    startPoint: Point;
    container: ContainerExtension;
};

export class ResizeHandler {
    protected selectHandler: SelectHandler;
    protected scene: Scene;

    public constructor(selectHandler: SelectHandler, scene: Scene) {
        this.selectHandler = selectHandler;
        this.scene = scene;
    }
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

            console.log(kind);
            console.log(container.isResizable === false);
            console.log(container.isSelectable === false);
            console.log(this.selectHandler.isSelectionResizable());

            if (
                container.isResizable === false ||
                container.isSelectable === false ||
                !this.selectHandler.isSelectionResizable()
            ) {
                return;
            }

            GBoard.viewport.on("globalmousemove", this.onGlobalPointerMove, {
                handler: this,
                startPoint: event.getLocalPosition(GBoard.viewport),
                container: container,
            });
        };

        const onPointerUp = () => {
            this.scene.viewport.off(
                "globalmousemove",
                this.onGlobalPointerMove,
            );
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
