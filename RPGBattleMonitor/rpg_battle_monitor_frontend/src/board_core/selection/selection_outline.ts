import { DestroyOptions, Graphics } from "pixi.js";
import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";
import { GSelectHandler } from "../handlers/select_handler";

export class SelectionOutline extends Graphics {
    public static readonly OUTLINE_OFFSET: Readonly<number> = 5;
    protected _outlineAround: ContainerExtension;

    constructor(around: ContainerExtension) {
        super();

        this._outlineAround = around;

        this.visible = false;

        GBoard.app.ticker.add(this.tickerStroke, this);
    }

    public destroy(options?: DestroyOptions): void {
        GBoard.app.ticker.remove(this.tickerStroke, this);

        super.destroy(options);
    }

    protected tickerStroke(): void {
        if (!this._outlineAround.displayedEntity) {
            return;
        }

        if (GSelectHandler.isSelected(this._outlineAround)) {
            this.visible = true;
            this.clear()
                .rect(
                    -SelectionOutline.OUTLINE_OFFSET,
                    -SelectionOutline.OUTLINE_OFFSET,
                    this._outlineAround.displayedEntity.width + 10,
                    this._outlineAround.displayedEntity.height + 10,
                )
                .stroke({
                    color: "red",
                    width: 3,
                });
        } else {
            this.visible = false;
        }
    }
}
