import { FederatedPointerEvent } from "pixi.js";
import { UniqueCollection } from "../utils/unique_collection";
import { GBoard } from "../board";
import { ContainerExtension } from "../extensions/container_extension";

export class SelectHandler {
    public static UNREGISTER_SELECT: string = "UNREGISTER_SELECT";

    protected _selected: UniqueCollection<ContainerExtension> =
        new UniqueCollection();

    public constructor() {}

    public get selections(): Readonly<ContainerExtension[]> {
        return this._selected.items;
    }

    public select(container: ContainerExtension): void {
        this._selected.add(container);
    }

    public deselect(container: ContainerExtension): void {
        this._selected.remove(container);
    }

    public isSelected(container: ContainerExtension): boolean {
        return this._selected.contains(container);
    }

    public registerSelect(container: ContainerExtension) {
        const onPointerDown = (event: FederatedPointerEvent) => {
            const target = event.target;
            if (!(target instanceof ContainerExtension)) {
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

    public unregisterSelect(container: ContainerExtension) {
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
