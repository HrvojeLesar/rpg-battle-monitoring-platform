export type EventNames = {
    "resize-finished": {};
};

export type EventEmitterTypes = {
    [K in keyof EventNames]: [event: EventNames[K]];
};
