import { ContainerExtension } from "../extensions/container_extension";
import { SelectHandler } from "../handlers/select_handler";
import { SelectionOutline } from "./selection_outline";

export class SingleSelectionOutline extends SelectionOutline {
    public constructor(
        around: ContainerExtension,
        selectHandler: SelectHandler,
    ) {
        super(around, selectHandler);
    }

    protected drawOutline(): void {
        if (this.selectHandler.isSelected(this._outlineAround)) {
            super.drawOutline();
        }
    }
}
