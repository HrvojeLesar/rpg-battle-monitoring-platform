export type TypedJson = { type: string; uid: string } & Record<string, unknown>;

export interface IMessagable {
    getType(): string;
    getUId(): string;
    toJSON(): TypedJson;
    getAttributes(): Record<string, unknown>;
}
