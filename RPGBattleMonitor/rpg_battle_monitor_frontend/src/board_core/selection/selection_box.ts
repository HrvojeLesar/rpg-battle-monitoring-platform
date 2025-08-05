import { Viewport } from "pixi-viewport";
import { FederatedPointerEvent, Graphics, Point } from "pixi.js";
import { GBoard } from "../board";
import { SelectHandler } from "../handlers/select_handler";

export class SelectionBox extends Graphics {
    protected _viewport: Viewport;
    protected selectHandler: SelectHandler;

    public constructor(viewport: Viewport, selectHandler: SelectHandler) {
        super();

        this._viewport = viewport;
        this.selectHandler = selectHandler;
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

            const bounds = this.getBounds().rectangle;
            GBoard.scene?.tokens.forEach((token) => {
                const tokenBounds = token.container.getBounds().rectangle;
                if (
                    bounds.intersects(tokenBounds) &&
                    token.container.isSelectable
                ) {
                    this.selectHandler.select(token.container);
                } else {
                    this.selectHandler.deselect(token.container);
                }
            });
        };

        const onPointerDown = (event: FederatedPointerEvent) => {
            // TODO: Handle touch properly
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            startPoint = event.getLocalPosition(this._viewport);

            this.selectHandler.clearSelections();

            this._viewport.addChild(this);
            this._viewport.on("globalpointermove", onGlobalPointerMove);
            this._viewport.on("pointerup", onPointerUp);
            this._viewport.on("pointerupoutside", onPointerUp);
        };

        const onPointerUp = (_event: FederatedPointerEvent) => {
            this._viewport.off("globalpointermove", onGlobalPointerMove);
            this._viewport.off("pointerup", onPointerUp);
            this._viewport.off("pointerupoutside", onPointerUp);
            this._viewport.removeChild(this);
            this.clear();

            this.selectHandler.selectGroup();
        };

        this._viewport.on("pointerdown", onPointerDown);

        // TODO: unregister events
    }
}
