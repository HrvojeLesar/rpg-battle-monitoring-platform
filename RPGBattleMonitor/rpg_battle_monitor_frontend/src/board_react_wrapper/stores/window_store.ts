import { atom } from "jotai";
import newUId from "@/board_core/utils/uuid_generator";
import { Coordinates, UniqueIdentifier } from "@dnd-kit/core/dist/types";
import { atomWithRefresh } from "jotai/utils";
import {
    WINDOW_MIN_HEIGHT,
    WINDOW_MIN_WIDTH,
} from "../components/floating_windows/Window";

const ZINDEX_OFFSET = 10;

export type WindowName = string;

export type WindowEntry = {
    id?: UniqueIdentifier;
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

const defaultWindowPosition = atomWithRefresh(() => {
    return {
        x: window.innerWidth / 2 - WINDOW_MIN_WIDTH,
        y: window.innerHeight / 2 - WINDOW_MIN_HEIGHT,
    };
});

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
        set(defaultWindowPosition);
        const defaultPosition = get(defaultWindowPosition);
        const entry: WindowEntryInner = {
            id: newUId(),
            position: window.position ?? defaultPosition,
            zIndex: window.zIndex ?? get(zIndexOffset) + 1,
            ...window,
        };

        state.windows = [...state.windows, entry];

        return { ...state };
    });
});

const openWindow = atom(
    null,
    (get, set, window: WindowEntry, force: boolean = false) => {
        const windows = get(windowAtom).windows;
        const searchValue: Maybe<UniqueIdentifier> = window.name ?? window.id;

        const foundWindow = windows.find(
            (w) => w.id === searchValue || w.name === searchValue,
        );

        if (!force && foundWindow) {
            set(updateWindowZIndex, foundWindow.id);
        } else {
            set(addWindow, window);
        }
    },
);

const closeWindow = atom(
    null,
    (get, set, id: UniqueIdentifier | WindowName) => {
        const existingWindows = get(windows);
        const window = existingWindows.find(
            (w) => w.id === id || w.name === id,
        );

        if (window) {
            set(removeWindow, window.id);
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
    closeWindow,
};
