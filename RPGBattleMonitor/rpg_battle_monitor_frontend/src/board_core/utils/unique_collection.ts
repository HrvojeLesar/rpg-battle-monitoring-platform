import { IUniqueCollection } from "../interfaces/unique_collection";

export class UniqueCollection<T> implements IUniqueCollection<T> {
    protected _items: T[] = [];

    public constructor() {}

    public add(entity: T): T {
        const entityIndex = this._items.indexOf(entity);

        if (entityIndex !== -1) {
            this._items.splice(entityIndex, 1);
        }

        this._items.push(entity);

        return entity;
    }

    public remove(entity: T): Option<T> {
        const entityIndex = this._items.indexOf(entity);

        if (entityIndex !== -1) {
            const removedEntity = this._items[entityIndex];
            this._items.splice(entityIndex, 1);

            return removedEntity;
        }

        return null;
    }

    public pop(): Option<T> {
        return this._items.pop();
    }

    public isEmpty(): boolean {
        return this._items.length === 0;
    }

    public getItems(): Readonly<T[]> {
        return this._items;
    }

    public get items(): Readonly<T[]> {
        return this.getItems();
    }

    public contains(entity: T): boolean {
        const entityIndex = this._items.indexOf(entity);

        return entityIndex !== -1;
    }

    public clear(): T[] {
        const old = this._items;
        this._items = [];

        return old;
    }
}
