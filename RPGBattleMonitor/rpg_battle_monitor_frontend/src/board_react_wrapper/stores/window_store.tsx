import { atom } from "jotai";
import newUId from "@/board_core/utils/uuid_generator";
import { Coordinates, UniqueIdentifier } from "@dnd-kit/core/dist/types";

export const testWindow = (id: UniqueIdentifier) => {
    return (
        <div>
            <p>Test Window {id}</p>
        </div>
    );
};

const genTestWindow = (idx: number): WindowEntry => {
    const id = newUId();
    return {
        id,
        window: testWindow(id),
        position: { x: 0, y: 0 },
        zIndex: idx,
    };
};

export type WindowEntry = {
    id: UniqueIdentifier;
    window: JSX.Element;
    position: Coordinates;
    zIndex: number;
};

export type WindowStoreState = {
    windows: WindowEntry[];
};

const initialState: WindowStoreState = {
    windows: [genTestWindow(1), genTestWindow(2), genTestWindow(3)],
};

const windowAtom = atom(initialState);

const windows = atom((get) => {
    return get(windowAtom).windows;
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

const updateWindowZIndex = atom(null, (_, set, id: UniqueIdentifier) => {
    set(windowAtom, (state) => {
        const window = state.windows.find((w) => w.id === id);
        if (!window) {
            return state;
        }

        if (!window) {
            return state;
        }

        if (window.zIndex === state.windows.length) {
            return state;
        }

        window.zIndex = state.windows.length + 1;
        state.windows.forEach((w) => {
            if (w.zIndex > 1) {
                w.zIndex -= 1;
            }
        });

        state.windows = [...state.windows];

        return { ...state };
    });
});

export const windowAtoms = {
    windowAtom,
    windows,
    updateWindowPosition,
    updateWindowZIndex,
};
