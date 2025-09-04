export type EventNames = {
    "board-init-started": () => void;
    "board-init-finished": () => void;
    "board-destoryed": () => void;
};

export type EventEmitterTypes = {
    [K in keyof EventNames]: Parameters<EventNames[K]>;
};
