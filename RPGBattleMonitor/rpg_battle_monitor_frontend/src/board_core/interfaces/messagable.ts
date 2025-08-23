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
    toJSON(): TypedJson<Attributes>;
    getAttributes(): Attributes;
    applyChanges(changes: TypedJson<Attributes>): void;
}
