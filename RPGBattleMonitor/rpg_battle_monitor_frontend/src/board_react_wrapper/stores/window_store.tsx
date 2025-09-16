import { atom } from "jotai";
import newUId from "@/board_core/utils/uuid_generator";
import { Coordinates, UniqueIdentifier } from "@dnd-kit/core/dist/types";

const ZINDEX_OFFSET = 10;

export type WindowName = string;

export type WindowEntry = {
    title?: string;
    name?: WindowName;
    position?: Coordinates;
    zIndex?: number;
    content?: JSX.Element;
    resizable?: boolean;
};

type WindowEntryInner = {
    id: UniqueIdentifier;
    position: Coordinates;
    zIndex: number;
} & WindowEntry;

export type WindowStoreState = {
    windows: WindowEntryInner[];
};

const initialState: WindowStoreState = {
    windows: [],
};

const windowAtom = atom(initialState);

const windows = atom((get) => {
    return get(windowAtom).windows;
});

const zIndexOffset = atom((get) => {
    return get(windowAtom).windows.length + ZINDEX_OFFSET;
});

const updateWindowPosition = atom(
    null,
    (_, set, id: UniqueIdentifier, delta: Coordinates) => {
        set(windowAtom, (state) => {
            const window = state.windows.find((w) => w.id === id);

            if (!window) {
                return state;
            }

            window.position.x += delta.x;
            window.position.y += delta.y;

            state.windows = [...state.windows];

            return { ...state };
        });
    },
);

const updateWindowZIndex = atom(null, (get, set, id: UniqueIdentifier) => {
    set(windowAtom, (state) => {
        const window = state.windows.find((w) => w.id === id);
        if (!window) {
            return state;
        }

        if (!window) {
            return state;
        }

        const zIndex = get(zIndexOffset);

        if (window.zIndex === zIndex) {
            return state;
        }

        window.zIndex = zIndex + 1;
        state.windows.forEach((w) => {
            if (w.zIndex > 1) {
                w.zIndex -= 1;
            }
        });

        state.windows = [...state.windows];

        return { ...state };
    });
});

const removeWindow = atom(null, (_, set, id: UniqueIdentifier) => {
    set(windowAtom, (state) => {
        state.windows = [...state.windows.filter((w) => w.id !== id)];

        return { ...state };
    });
});

const addWindow = atom(null, (get, set, window: WindowEntry) => {
    set(windowAtom, (state) => {
        const entry: WindowEntryInner = {
            id: newUId(),
            position: window.position ?? { x: 0, y: 0 },
            zIndex: window.zIndex ?? get(zIndexOffset) + 1,
            ...window,
        };

        state.windows = [...state.windows, entry];

        return { ...state };
    });
});

const openWindow = atom(
    null,
    (get, set, window: WindowEntry | UniqueIdentifier | WindowName) => {
        const windows = get(windowAtom).windows;
        let foundWindow: WindowEntryInner | undefined = undefined;
        if (typeof window === "string" || typeof window === "number") {
            foundWindow = windows.find(
                (w) => w.id === window || w.name === window,
            );
        }

        if (foundWindow) {
            set(updateWindowZIndex, foundWindow.id);
        } else if (typeof window === "object") {
            set(addWindow, window);
        }
    },
);

export const windowAtoms = {
    windowAtom,
    windows,
    updateWindowPosition,
    updateWindowZIndex,
    removeWindow,
    openWindow,
};
