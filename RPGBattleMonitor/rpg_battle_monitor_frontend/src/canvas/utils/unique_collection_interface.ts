export interface IUniqueCollection {
    addItem: <T>(collection: T[], entity: T) => T;
    removeItem: <T>(collection: T[], entity: T) => Option<T>;
}

export function addItem<T>(collection: T[], entity: T): T {
    const entityIndex = collection.indexOf(entity);

    if (entityIndex !== -1) {
        collection.splice(entityIndex, 1);
    }

    collection.push(entity);

    return entity;
}

export function removeItem<T>(collection: T[], entity: T): Option<T> {
    const entityIndex = collection.indexOf(entity);

    if (entityIndex !== -1) {
        const removedEntity = collection[entityIndex];
        collection.splice(entityIndex, 1);

        return removedEntity;
    }

    return null;
}
