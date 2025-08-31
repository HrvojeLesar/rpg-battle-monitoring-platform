export type EventNames = {
    "resize-finished": () => void;
};

export type EventEmitterTypes = {
    [K in keyof EventNames]: [event: EventNames[K]];
};
