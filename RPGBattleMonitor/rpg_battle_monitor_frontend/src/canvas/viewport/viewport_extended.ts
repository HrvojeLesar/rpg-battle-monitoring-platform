import { type IViewportOptions, Viewport } from "pixi-viewport";
import { isDev } from "../../utils/dev_mode";
import { Graphics } from "pixi.js";

export class ViewportExtended extends Viewport {
    public constructor(options: IViewportOptions) {
        super(options);

        if (isDev()) {
            const line = this.addChild(new Graphics());
            line.setStrokeStyle({ width: 10, color: 0xff0000 })
                .rect(0, 0, this.worldWidth, this.worldHeight)
                .stroke();
        }
    }
}
