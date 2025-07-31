export interface IUniqueCollection<T> {
    add: (entity: T) => T;
    remove: (entity: T) => Option<T>;
}

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
}
