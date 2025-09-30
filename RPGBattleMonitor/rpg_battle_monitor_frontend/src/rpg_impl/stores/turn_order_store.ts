import { atom } from "jotai";
import { TurnOrder } from "../turn/turn_order";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { RpgScene } from "../scene/scene";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";

export type TurnOrderBoxed = { turnOrder: Maybe<TurnOrder> };

export type SceneTurnOrderState = {
    turnOrder: Maybe<TurnOrder>;
};

const initialState: SceneTurnOrderState = {
    turnOrder: undefined,
};

const turnOrderAtom = atom(initialState);

const currentTurnOrder = atom<TurnOrderBoxed, [], void>(
    (get) => {
        const currentTurnOrder = get(turnOrderAtom).turnOrder;
        const currentScene = get(sceneAtoms.getCurrentScene);
        if (!(currentScene instanceof RpgScene)) {
            return { turnOrder: undefined };
        }

        if (currentTurnOrder === undefined) {
            return { turnOrder: currentScene.turnOrder };
        }

        return { turnOrder: currentTurnOrder };
    },
    (get, set) => {
        const { turnOrder } = get(currentTurnOrder);
        set(turnOrderAtom, (state) => {
            return { ...state, ...turnOrder };
        });
    },
);

const refreshTurnOrder = atom(null, (get, set) => {
    const { turnOrder } = get(currentTurnOrder);
    const currentScene = get(sceneAtoms.getCurrentScene);
    if (!(currentScene instanceof RpgScene)) {
        return;
    }

    if (currentScene.turnOrder !== turnOrder) {
        return;
    }

    set(turnOrderAtom, (state) => {
        return { ...state };
    });
});

// TODO: register handler to it cannot clash with init order
GAtomStore.sub(sceneAtoms.getCurrentScene, () => {
    GAtomStore.set(currentTurnOrder);
});

export const turnOrderAtoms = {
    turnOrderAtom,
    currentTurnOrder,
    refreshTurnOrder,
};
