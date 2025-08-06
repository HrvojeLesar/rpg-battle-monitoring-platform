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
    initialWidth: number;
    initialHeight: number;
    initialPoint: Point;
    kind: ResizeKind;
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
                initialWidth:
                    container.displayedEntity?.width ?? container.width,
                initialHeight:
                    container.displayedEntity?.height ?? container.height,
                initialPoint: container.position,
                kind: kind,
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
        const modifyX = localPos.x - this.startPoint.x;
        const modifyY = localPos.y - this.startPoint.y;

        const modifyContainer =
            this.container.displayedEntity ?? this.container;

        if (this.kind === ResizeKind.Right) {
            const widthResult = this.initialWidth + modifyX;
            modifyContainer.width = widthResult;
        }

        if (this.kind === ResizeKind.Bottom) {
            const heightResult = this.initialHeight + modifyY;
            modifyContainer.height = heightResult;
        }

        if (this.kind === ResizeKind.Left) {
            const widthResult = this.initialWidth - modifyX;
            this.container.position.x = modifyX;
            modifyContainer.width = widthResult;
        }

        if (this.kind === ResizeKind.Top) {
            const heightResult = this.initialHeight - modifyY;
            this.container.position.y = modifyY;
            modifyContainer.height = heightResult;
        }

        if (this.kind === ResizeKind.BottomRight) {
            const widthResult = this.initialWidth + modifyX;
            modifyContainer.width = widthResult;
            const heightResult = this.initialHeight + modifyY;
            modifyContainer.height = heightResult;
        }

        if (this.kind === ResizeKind.TopRight) {
            const heightResult = this.initialHeight - modifyY;
            this.container.position.y = modifyY;
            modifyContainer.height = heightResult;
            const widthResult = this.initialWidth + modifyX;
            modifyContainer.width = widthResult;
        }

        if (this.kind === ResizeKind.BottomLeft) {
            const heightResult = this.initialHeight + modifyY;
            modifyContainer.height = heightResult;
            const widthResult = this.initialWidth - modifyX;
            this.container.position.x = modifyX;
            modifyContainer.width = widthResult;
        }

        if (this.kind === ResizeKind.TopLeft) {
            const widthResult = this.initialWidth - modifyX;
            this.container.position.x = modifyX;
            modifyContainer.width = widthResult;
            const heightResult = this.initialHeight - modifyY;
            this.container.position.y = modifyY;
            modifyContainer.height = heightResult;
        }
    }
}
