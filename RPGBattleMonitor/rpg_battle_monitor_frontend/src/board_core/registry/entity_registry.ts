import { GBoard } from "../board";
import { EmptyTokenDataConverter } from "../converters/empty_token_data_converter";
import { GridConverter } from "../converters/grid_converter";
import { SceneConverter } from "../converters/scene_converter";
import { SpriteExtensionConverter } from "../converters/sprite_extension_converter";
import { TokenConverter } from "../converters/token_converter";
import { SpriteExtension } from "../extensions/sprite_extension";
import { Grid } from "../grid/grid";
import {
    DeleteAction,
    IMessagable,
    TypedJson,
    UId,
} from "../interfaces/messagable";
import { Scene } from "../scene";
import { EmptyTokenData } from "../token/empty_token_data";
import { Token } from "../token/token";

export type EntityKind = string;
export type OrderPriority = number;
export type Converter<T = any> = (attributes: TypedJson<T>) => IMessagable<T>;

type ConverterAndPriority = {
    priority: OrderPriority;
    converter: Converter;
};

class RegisteredEntityKinds {
    protected entityKinds: Map<EntityKind, ConverterAndPriority> = new Map();
    protected count: number = 0;

    public constructor() {}

    public register(
        kind: EntityKind,
        converter: Converter,
        priority?: OrderPriority,
    ): void {
        priority = priority ?? ++this.count;

        if (this.isPriorityRegistered(priority)) {
            this.incrementProrities(priority);
        }

        this.entityKinds.set(kind, { priority, converter });
    }

    public getPriority(kind: EntityKind): Option<OrderPriority> {
        return this.entityKinds.get(kind)?.priority;
    }

    protected isPriorityRegistered(priority: OrderPriority): boolean {
        const values = Array.from(this.entityKinds.values());
        const filtered = values.filter((v) => v.priority === priority);

        return filtered.length > 0;
    }

    protected incrementProrities(minPriority: OrderPriority): void {
        for (const [key, value] of this.entityKinds.entries()) {
            if (minPriority > value.priority) {
                continue;
            }
            this.entityKinds.set(key, {
                ...value,
                priority: value.priority + 1,
            });
        }
    }

    public tryConvert<T>(entityData: TypedJson<T>): Maybe<IMessagable<T>> {
        const converter = this.entityKinds.get(entityData.kind);

        try {
            if (converter) {
                return converter.converter(entityData);
            }
        } catch (e) {
            console.warn(e);
        }

        return undefined;
    }
}

class EntityContainer {
    protected entitiesMap: Map<UId, IMessagable> = new Map();

    public constructor() {}

    public add(entity: IMessagable): void {
        this.entitiesMap.set(entity.getUId(), entity);
    }

    public get(uid: UId | IMessagable): Option<IMessagable> {
        if (typeof uid === "object") {
            return this.entitiesMap.get(uid.getUId());
        }

        return this.entitiesMap.get(uid);
    }

    public remove(entity: IMessagable): DeleteAction {
        const deleteAction: DeleteAction = {
            acc: [],
            cleanupCallbacks: [],
        };
        const existingEntity = this.entitiesMap.get(entity.getUId());

        if (existingEntity) {
            this.entitiesMap.delete(entity.getUId());
            existingEntity.deleteAction(deleteAction);
        }

        for (const removedEntity of deleteAction.acc) {
            this.entitiesMap.delete(removedEntity.getUId());
        }

        return deleteAction;
    }
}

export class EntityRegistry {
    protected _entities: EntityContainer = new EntityContainer();
    protected _registeredEntityKinds: RegisteredEntityKinds =
        new RegisteredEntityKinds();
    protected tokenConverter: TokenConverter = new TokenConverter();
    protected _queuedEntities: TypedJson[] = [];

    public constructor() {}

    public get entities(): EntityContainer {
        return this._entities;
    }

    public get registeredEntityKinds(): RegisteredEntityKinds {
        return this._registeredEntityKinds;
    }

    public get getSortedQueuedEntities(): TypedJson[] {
        const entities = [...this._queuedEntities];

        entities.sort((a, b) => {
            const aPriority =
                this._registeredEntityKinds.getPriority(a.kind) ??
                Number.MAX_SAFE_INTEGER;

            const bPriority =
                this._registeredEntityKinds.getPriority(b.kind) ??
                Number.MAX_SAFE_INTEGER;

            return aPriority - bPriority;
        });

        return entities;
    }

    public convertQueuedEntities(): void {
        const entities = this.getSortedQueuedEntities;
        for (const entityData of entities) {
            const entity = this._registeredEntityKinds.tryConvert(entityData);
            if (entity !== undefined) {
                this._entities.add(entity);
            }
        }

        this._queuedEntities = [];
    }

    public queue(entityData: TypedJson[]): void;
    public queue(entityData: TypedJson | TypedJson[]): void {
        if (Array.isArray(entityData)) {
            for (const entity of entityData) {
                this._queuedEntities.push(entity);
            }
        } else {
            this._queuedEntities.push(entityData);
        }
    }

    public static defaultEntityRegistry(): EntityRegistry {
        const registry = new EntityRegistry();

        registry.registeredEntityKinds.register(
            Grid.getKindStatic(),
            GridConverter.convert,
        );
        registry.registeredEntityKinds.register(
            Scene.getKindStatic(),
            SceneConverter.convert,
        );
        registry.registeredEntityKinds.register(
            SpriteExtension.getKindStatic(),
            SpriteExtensionConverter.convert,
        );
        registry.registeredEntityKinds.register(
            EmptyTokenData.getKindStatic(),
            EmptyTokenDataConverter.convert,
        );
        registry.registeredEntityKinds.register(
            Token.getKindStatic(),
            TokenConverter.convert,
        );

        return registry;
    }

    public removeQueuedEntities(): void {
        const entities = this.getSortedQueuedEntities;
        entities.reverse();

        for (const entityData of entities) {
            const entity = this.entities.get(entityData.uid);
            if (entity) {
                const deleteAction = this.entities.remove(entity);

                deleteAction.cleanupCallbacks.forEach((cb) => cb());
            }
        }

        GBoard.websocket.clear("deleteQueue");

        this._queuedEntities = [];
    }
}
