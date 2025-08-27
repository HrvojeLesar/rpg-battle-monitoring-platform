import { EmptyTokenDataConverter } from "../converters/empty_token_data_converter";
import { GridConverter } from "../converters/grid_converter";
import { SceneConverter } from "../converters/scene_converter";
import { SpriteExtensionConverter } from "../converters/sprite_extension_converter";
import { TokenConverter } from "../converters/token_converter";
import { SpriteExtension } from "../extensions/sprite_extension";
import { Grid } from "../grid/grid";
import { IMessagable, TypedJson, UId } from "../interfaces/messagable";
import { Scene } from "../scene";
import { EmptyTokenData } from "../token/empty_token_data";
import { Token } from "../token/token";
import { UniqueCollection } from "../utils/unique_collection";

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
    protected entities: UniqueCollection<IMessagable> = new UniqueCollection();

    public constructor() {}

    public add(entity: IMessagable): void {
        this.entitiesMap.set(entity.getUId(), entity);
        this.entities.add(entity);
    }

    public get(uid: UId): Option<IMessagable> {
        return this.entitiesMap.get(uid);
    }

    public remove(entity: IMessagable): void {
        this.entitiesMap.delete(entity.getUId());
        this.entities.remove(entity);
    }

    public list(): IMessagable[] {
        return this.entities.getCopy();
    }
}

export class EntityRegistry {
    protected _entities: EntityContainer = new EntityContainer();
    protected _registeredEntityKinds: RegisteredEntityKinds =
        new RegisteredEntityKinds();
    protected tokenConverter: TokenConverter = new TokenConverter();

    public constructor() {}

    public get entities(): EntityContainer {
        return this._entities;
    }

    public get registeredEntityKinds(): RegisteredEntityKinds {
        return this._registeredEntityKinds;
    }

    public get sortedEntities(): IMessagable[] {
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
}
