import {
    Container,
    FederatedPointerEvent,
    ObservablePoint,
    Point,
} from "pixi.js";
import { ContainerExtension } from "../extensions/container_extension";
import { GBoard } from "../board";
import { DragHandler } from "./drag_handler";
import { SelectHandler } from "./select_handler";
import { Scene } from "../scene";
import { IResizable } from "../interfaces/resizable";

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
    container: IResizable & Container;
    initialWidth: number;
    initialHeight: number;
    initialPoint: ObservablePoint;
    kind: ResizeKind;
};

export class ResizeHandler {
    public static UNREGISTER_RESIZE: string = "UNREGISTER_RESIZE";
    protected selectHandler: SelectHandler;
    protected scene: Scene;

    public constructor(selectHandler: SelectHandler, scene: Scene) {
        this.selectHandler = selectHandler;
        this.scene = scene;
    }

    public registerResize(
        resizeDragPoint: Container,
        container: ContainerExtension & IResizable,
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

            GBoard.viewport.on("globalpointermove", this.onGlobalPointerMove, {
                handler: this,
                startPoint: event.getLocalPosition(GBoard.viewport),
                container: container,
                initialWidth: container.getInitialWidth(),
                initialHeight: container.getInitialHeight(),
                initialPoint: container.getInitialPosition(),
                kind: kind,
            });
        };

        const onPointerUp = () => {
            this.scene.viewport.off(
                "globalpointermove",
                this.onGlobalPointerMove,
            );

            container.eventEmitter.emit("resize-end");

            GBoard.websocket.flush();
        };

        resizeDragPoint.on("pointerdown", onPointerDown);
        resizeDragPoint.on("pointerup", onPointerUp);
        resizeDragPoint.on("pointerupoutside", onPointerUp);

        const unregisterResize = () => {
            resizeDragPoint.off("pointerdown", onPointerDown);
            resizeDragPoint.off("pointerup", onPointerUp);
            resizeDragPoint.off("pointerupoutside", onPointerUp);
        };

        this.scene.eventStore.register(
            container,
            ResizeHandler.UNREGISTER_RESIZE,
            unregisterResize,
        );
    }

    protected onGlobalPointerMove(
        this: OnGlobalPointerMove,
        event: FederatedPointerEvent,
    ) {
        const localPos = event.getLocalPosition(GBoard.viewport);
        this.container.resize(
            localPos,
            this.startPoint,
            this.initialWidth,
            this.initialHeight,
            this.kind,
        );
    }

    public unregisterResize(container: ContainerExtension) {
        this.scene.eventStore.unregister(
            container,
            ResizeHandler.UNREGISTER_RESIZE,
        );
    }
}
