import { ContainerExtension } from "../extensions/container_extension";
import { SelectedItemMeta } from "../handlers/select_handler";

export class SelectedMap {
    protected _selected: Map<ContainerExtension, SelectedItemMeta> = new Map();
    protected _selectionsCache: Maybe<ContainerExtension[]> = undefined;

    public constructor() {}

    public get selections(): Readonly<ContainerExtension[]> {
        if (this._selectionsCache) {
            return this._selectionsCache;
        }

        this._selectionsCache = Array.from(this._selected.keys());

        return this._selectionsCache;
    }

    public clear(): [ContainerExtension, SelectedItemMeta][] {
        const entries = Array.from(this._selected.entries());
        for (const [_container, meta] of entries) {
            meta.outline.destroy();
        }

        this._selected.clear();
        this._selectionsCache = undefined;

        return entries;
    }

    public set(container: ContainerExtension, meta: SelectedItemMeta) {
        this._selected.set(container, meta);
        this._selectionsCache = undefined;
    }

    public get(container: ContainerExtension): SelectedItemMeta | undefined {
        return this._selected.get(container);
    }

    public entries(): MapIterator<[ContainerExtension, SelectedItemMeta]> {
        return this._selected.entries();
    }

    public delete(
        container: ContainerExtension,
    ): [ContainerExtension, SelectedItemMeta] | undefined {
        const selection = this._selected.get(container);
        this._selected.get(container)?.outline.destroy();
        this._selected.delete(container);

        if (!selection) {
            return undefined;
        }

        this._selectionsCache = undefined;
        return [container, selection];
    }
}
