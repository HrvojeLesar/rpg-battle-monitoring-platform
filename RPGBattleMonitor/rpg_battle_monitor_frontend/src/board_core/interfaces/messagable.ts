type DefaultAttributes = Record<string, unknown>;

export type TypedJson<Attributes = DefaultAttributes> = {
    kind: string;
    uid: string;
    timestamp: number;
    game: number;
} & Attributes;

export interface IMessagable<Attributes = DefaultAttributes> {
    getKind(): string;
    getUId(): string;
    toJSON(): TypedJson;
    getAttributes(): Attributes;
    applyChanges(changes: Attributes): void;
}
