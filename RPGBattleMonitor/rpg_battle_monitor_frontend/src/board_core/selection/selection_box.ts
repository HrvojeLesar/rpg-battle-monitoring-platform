import { Viewport } from "pixi-viewport";
import { FederatedPointerEvent, Graphics, Point } from "pixi.js";
import { GBoard } from "../board";

export class SelectionBox extends Graphics {
    protected _viewport: Viewport;

    public constructor(viewport: Viewport) {
        super();

        this._viewport = viewport;
        this.alpha = 0.5;
        this.initEvents();
    }

    protected initEvents(): void {
        let startPoint = new Point();

        const onGlobalPointerMove = (event: FederatedPointerEvent) => {
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

            const bounds = this.getBounds();
            GBoard.scene?.tokens.forEach((token) => {
                const tokenBounds = token.container.getBounds();
                if (bounds.intersects(tokenBounds)) {
                    GBoard.selectHandler.select(token.container);
                } else {
                    GBoard.selectHandler.deselect(token.container);
                }
            });
        };

        const onPointerDown = (event: FederatedPointerEvent) => {
            // TODO: Handle touch properly
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            startPoint = event.getLocalPosition(this._viewport);

            GBoard.selectHandler.clearSelections();

            this._viewport.addChild(this);
            this._viewport.on("globalpointermove", onGlobalPointerMove);
        };

        const onPointerUp = (_event: FederatedPointerEvent) => {
            this._viewport.off("globalpointermove", onGlobalPointerMove);
            this._viewport.removeChild(this);
            this.clear();
        };

        this._viewport.on("pointerdown", onPointerDown);
        this._viewport.on("pointerup", onPointerUp);
        this._viewport.on("pointerupoutside", onPointerUp);

        // TODO: unregister events
    }
}
