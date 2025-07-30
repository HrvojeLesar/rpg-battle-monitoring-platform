export interface IUniqueCollection<T> {
    addItem: (entity: T) => T;
    removeItem: (entity: T) => Option<T>;
}

export class UniqueCollection<T> implements IUniqueCollection<T> {
    protected _items: T[] = [];

    public constructor() {}

    public addItem(entity: T): T {
        const entityIndex = this._items.indexOf(entity);

        if (entityIndex !== -1) {
            this._items.splice(entityIndex, 1);
        }

        this._items.push(entity);

        return entity;
    }

    public removeItem(entity: T): Option<T> {
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
}
