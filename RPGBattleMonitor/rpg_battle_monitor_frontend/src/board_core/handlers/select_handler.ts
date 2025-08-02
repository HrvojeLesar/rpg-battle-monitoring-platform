import { FederatedPointerEvent } from "pixi.js";
import { IContainerMixin } from "../mixins/container_mixin";
import { UniqueCollection } from "../utils/unique_collection";
import { tryCastContainerAsMixin } from "../mixins/mixin_classes";
import { GBoard } from "../board";

export class SelectHandler {
    public static UNREGISTER_SELECT: string = "UNREGISTER_SELECT";

    protected _selected: UniqueCollection<IContainerMixin> =
        new UniqueCollection();

    public constructor() {}

    public get selections(): Readonly<IContainerMixin[]> {
        return this._selected.items;
    }

    public select(container: IContainerMixin): void {
        this._selected.add(container);
    }

    public deselect(container: IContainerMixin): void {
        this._selected.remove(container);
    }

    public isSelected(container: IContainerMixin): boolean {
        return this._selected.contains(container);
    }

    public registerSelect(container: IContainerMixin) {
        const onPointerDown = (event: FederatedPointerEvent) => {
            const target = tryCastContainerAsMixin(event.target);
            if (!target) {
                return;
            }

            // TODO: Add multiselect handler
            if (!this.isSelected(target) && target.isSelectable) {
                this.clearSelections();
                this.select(target);
            }
        };

        container.on("pointerdown", onPointerDown);

        const unregister = () => {
            container.off("pointerdown", onPointerDown);
        };

        GBoard.eventStore.register(
            container,
            SelectHandler.UNREGISTER_SELECT,
            unregister,
        );
    }

    public unregisterSelect(container: IContainerMixin) {
        this.deselect(container);
        GBoard.eventStore.unregister(
            container,
            SelectHandler.UNREGISTER_SELECT,
        );
    }

    public clearSelections() {
        this._selected.clear();
    }
}
