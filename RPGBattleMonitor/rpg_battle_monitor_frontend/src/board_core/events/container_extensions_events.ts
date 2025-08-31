export type EventNames = {
    "drag-start": () => void;
    "drag-end": () => void;
    "resize-start": () => void;
    "resize-end": () => void;
};

export type ContainerEventTypes = {
    [K in keyof EventNames]: Parameters<EventNames[K]>;
};
