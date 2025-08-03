import { FederatedPointerEvent } from "pixi.js";
import { UniqueCollection } from "../utils/unique_collection";
import { ContainerExtension } from "../extensions/container_extension";
import { GEventStore } from "./registered_event_store";

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
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

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

        GEventStore.register(
            container,
            SelectHandler.UNREGISTER_SELECT,
            unregister,
        );
    }

    public unregisterSelect(container: ContainerExtension) {
        this.deselect(container);
        GEventStore.unregister(container, SelectHandler.UNREGISTER_SELECT);
    }

    public clearSelections() {
        this._selected.clear();
    }
}

export const GSelectHandler = new SelectHandler();
