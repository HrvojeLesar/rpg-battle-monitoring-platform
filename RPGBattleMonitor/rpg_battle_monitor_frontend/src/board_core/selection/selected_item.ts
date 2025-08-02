import { Container, DestroyOptions, Graphics } from "pixi.js";
import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";

export class SelectionOutline<T extends Container> extends Graphics {
    protected _outlineAround: ContainerExtension<T>;

    constructor(around: ContainerExtension<T>) {
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

        if (GBoard.selectHandler.isSelected(this._outlineAround)) {
            this.visible = true;
            this.rect(
                -5,
                -5,
                this._outlineAround.displayedEntity.width + 10,
                this._outlineAround.displayedEntity.height + 10,
            ).stroke({
                color: "red",
                width: 3,
            });
        } else {
            this.visible = false;
        }
    }
}
