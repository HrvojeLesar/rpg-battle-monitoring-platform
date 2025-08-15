export interface IUniqueCollection<T> {
    add: (entity: T) => T;
    remove: (entity: T) => Option<T>;
    getItems: () => Readonly<T[]>;
    contains: (entity: T) => boolean;
    clear: () => T[];
}
