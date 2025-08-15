import { Container } from "pixi.js";
import {
    ContainerExtension,
    ContainerExtensionOptions,
} from "../extensions/container_extension";
import { SelectionOutline } from "./selection_outline";
import { SelectHandler } from "../handlers/select_handler";
import { Grid } from "../grid/grid";

export type SelectionHolder = InstanceType<typeof SelectionHolderInner>;

class SelectionHolderOutline extends SelectionOutline {
    protected drawOutline(): void {
        if (this.selectHandler.isMultiSelection()) {
            this.visible = true;
            this._outline
                .clear()
                .rect(
                    0,
                    0,
                    this._outlineAround.width,
                    this._outlineAround.height,
                )
                .stroke({
                    color: "red",
                    width: 5,
                });
        } else {
            this.visible = false;
        }
    }
}

export class SelectionHolderContainer extends ContainerExtension {
    protected _holder: SelectionHolderInner;
    protected outline: SelectionHolderOutline;

    public constructor(
        grid: Grid,
        selectHandler: SelectHandler,
        options?: ContainerExtensionOptions,
    ) {
        super(grid, options);

        this._holder = new SelectionHolderInner(selectHandler, options);
        this.outline = new SelectionHolderOutline(
            this._holder as any as ContainerExtension,
            selectHandler,
        );
        this.addChild(this._holder);
        this.addChild(this.outline);
    }

    public get holder(): SelectionHolderInner {
        return this._holder;
    }
}

class SelectionHolderInner extends Container {
    protected selectHandler: SelectHandler;

    public constructor(
        selectHandler: SelectHandler,
        options?: ContainerExtensionOptions,
    ) {
        super(options);

        this.selectHandler = selectHandler;
    }
}
