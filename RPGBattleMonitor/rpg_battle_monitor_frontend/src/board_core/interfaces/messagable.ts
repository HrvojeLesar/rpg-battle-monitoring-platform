export type TypedJson = {
    kind: string;
    uid: string;
    timestamp: number;
    game: number;
} & Record<string, unknown>;

export interface IMessagable {
    getKind(): string;
    getUId(): string;
    toJSON(): TypedJson;
    getAttributes(): Record<string, unknown>;
    applyChanges(changes: Record<string, unknown>): void;
}
