import { Viewport } from "pixi-viewport";
import { FederatedPointerEvent, Graphics, Point } from "pixi.js";
import { SelectHandler } from "../handlers/select_handler";
import { Scene } from "../scene";
import { ContainerExtension } from "../extensions/container_extension";

export class SelectionBox extends Graphics {
    protected _scene: Scene;
    protected _viewport: Viewport;
    protected selectHandler: SelectHandler;

    public constructor(scene: Scene, selectHandler: SelectHandler) {
        super({ label: "selectionBox" });

        this._scene = scene;
        this._viewport = scene.viewport;
        this.selectHandler = selectHandler;
        this.alpha = 0.5;

        this.initEvents();
    }

    protected initEvents(): void {
        let startPoint = new Point();

        const onGlobalPointerMove = (event: FederatedPointerEvent) => {
            if (this._viewport.input.touches.length > 1) {
                return onPointerUp();
            }

            if (this.selectHandler.pause) {
                return onPointerUp();
            }

            if (this._scene.selectedLayer.container.eventMode === "none") {
                return onPointerUp();
            }

            const endPoint = event.getLocalPosition(this._viewport);
            let width = endPoint.x - startPoint.x;
            let height = endPoint.y - startPoint.y;

            let x = startPoint.x;
            if (width < 0) {
                x = endPoint.x;
                width = width * -1;
            }

            let y = startPoint.y;
            if (height < 0) {
                y = endPoint.y;
                height = height * -1;
            }

            this.clear()
                .rect(x, y, width, height)
                .fill({ color: "green" })
                .stroke({ color: "white", width: 1 });

            const bounds = this.getBounds().rectangle;

            this._scene.selectedLayer.container.children.forEach((child) => {
                if (!(child instanceof ContainerExtension)) {
                    return;
                }

                const tokenBounds = child.getBounds().rectangle;
                if (bounds.intersects(tokenBounds)) {
                    if (
                        child.isSelectable &&
                        !this.selectHandler.isSelected(child)
                    ) {
                        this.selectHandler.select(child);
                    }
                } else {
                    if (this.selectHandler.isSelected(child)) {
                        this.selectHandler.deselect(child);
                    }
                }
            });
        };

        const onPointerDown = (event: FederatedPointerEvent) => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            if (this._viewport.input.touches.length > 1) {
                return;
            }

            if (this.selectHandler.pause) {
                this.selectHandler.clearSelections();
                return;
            }

            if (this._viewport.input.touches.length === 1) {
                this._viewport.plugins.pause("drag");
            }

            startPoint = event.getLocalPosition(this._viewport);

            this.selectHandler.clearSelections();

            this._viewport.addChild(this);
            this._viewport.on("globalpointermove", onGlobalPointerMove);
            this._viewport.on("pointerup", onPointerUp);
            this._viewport.on("pointerupoutside", onPointerUp);
        };

        const onPointerUp = () => {
            this._viewport.plugins.resume("drag");
            this._viewport.off("globalpointermove", onGlobalPointerMove);
            this._viewport.off("pointerup", onPointerUp);
            this._viewport.off("pointerupoutside", onPointerUp);
            this._viewport.removeChild(this);
            this.clear();
        };

        this._viewport.on("pointerdown", onPointerDown);

        // TODO: unregister events
    }
}
