import { BaseEntity } from "../entity/base_entity";
import { Grid } from "../grid/grid";
import { UId } from "../interfaces/messagable";
import { Scene } from "../scene";
import { Token } from "../token/token";
import { TokenDataBase } from "../token/token_data";
import { UniqueCollection } from "../utils/unique_collection";

export type EntityKind = string;
export type OrderPriority = number;

class RegisteredEntityKinds {
    protected entityKinds: Map<EntityKind, OrderPriority> = new Map();

    public constructor() {}

    public register(kind: EntityKind, priority: OrderPriority): void {
        if (this.isPriorityRegistered(priority)) {
            this.incrementProrities(priority);
        }

        this.entityKinds.set(kind, priority);
    }

    public getPriority(kind: EntityKind): Option<OrderPriority> {
        return this.entityKinds.get(kind);
    }

    protected isPriorityRegistered(priority: OrderPriority): boolean {
        const values = Array.from(this.entityKinds.values());
        const filtered = values.filter((v) => v === priority);

        return filtered.length > 0;
    }

    protected incrementProrities(minPriority: OrderPriority): void {
        for (const [key, value] of this.entityKinds.entries()) {
            if (minPriority > value) {
                continue;
            }
            this.entityKinds.set(key, value + 1);
        }
    }
}

class EntityContainer {
    protected entitiesMap: Map<UId, BaseEntity> = new Map();
    protected entities: UniqueCollection<BaseEntity> = new UniqueCollection();

    public constructor() {}

    public add(entity: BaseEntity): void {
        this.entitiesMap.set(entity.getUId(), entity);
        this.entities.add(entity);
    }

    public get(uid: UId): Option<BaseEntity> {
        return this.entitiesMap.get(uid);
    }

    public remove(entity: BaseEntity): void {
        this.entitiesMap.delete(entity.getUId());
        this.entities.remove(entity);
    }

    public list(): BaseEntity[] {
        return this.entities.getCopy();
    }
}

export class EntityRegistry {
    protected _entities: EntityContainer = new EntityContainer();
    protected _registeredEntityKinds: RegisteredEntityKinds =
        new RegisteredEntityKinds();

    public constructor() {}

    public get entities(): EntityContainer {
        return this._entities;
    }

    public get sortedEntities(): BaseEntity[] {
        const entities = this._entities.list();

        entities.sort((a, b) => {
            const aPriority =
                this._registeredEntityKinds.getPriority(a.getKind()) ??
                Number.MAX_SAFE_INTEGER;

            const bPriority =
                this._registeredEntityKinds.getPriority(b.getKind()) ??
                Number.MAX_SAFE_INTEGER;

            return aPriority - bPriority;
        });

        return entities;
    }

    public registerEntityKind(kind: EntityKind, priority: OrderPriority): void {
        this._registeredEntityKinds.register(kind, priority);
    }

    public static defaultEntityRegistry(): EntityRegistry {
        const registry = new EntityRegistry();

        registry.registerEntityKind(Grid.getKindStatic(), 1);
        registry.registerEntityKind(Scene.getKindStatic(), 2);
        registry.registerEntityKind(TokenDataBase.getKindStatic(), 3);
        registry.registerEntityKind(Token.getKindStatic(), 4);

        return registry;
    }
}
