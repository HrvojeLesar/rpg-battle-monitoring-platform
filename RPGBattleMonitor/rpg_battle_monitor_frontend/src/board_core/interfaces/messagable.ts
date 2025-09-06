export type UId = string;
export type DefaultAttributes = Record<string, unknown>;

export type TypedJson<Attributes = DefaultAttributes> = {
    kind: string;
    uid: UId;
    timestamp: number;
} & Attributes;

export interface IMessagable<Attributes = DefaultAttributes> {
    getKind(): string;
    getUId(): UId;
    setUId(uid: UId): void;
    toJSON(): TypedJson<Attributes>;
    getAttributes(): Attributes;
    applyUpdateAction(changes: TypedJson<Attributes>): void;
    deleteAction(): void;
    addDependant(entity: IMessagable): void;
    getLastChangesTimestamp(): Maybe<number>;
    shouldApplyChanges(changes: TypedJson<Attributes>): boolean;
}

export function shouldApplyChanges<T>(
    entity: IMessagable<T>,
    changes: TypedJson<T>,
): boolean {
    const lastChanges = entity.getLastChangesTimestamp();
    if (lastChanges === undefined || lastChanges <= changes.timestamp) {
        return true;
    } else {
        return false;
    }
}
