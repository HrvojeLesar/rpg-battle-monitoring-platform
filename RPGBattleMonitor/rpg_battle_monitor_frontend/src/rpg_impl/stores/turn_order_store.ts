import { atom } from "jotai";
import { TurnOrder } from "../turn/turn_order";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { RpgScene } from "../scene/scene";

export type SceneTurnOrderState = {
    turnOrder: Maybe<TurnOrder>;
};

const initialState: SceneTurnOrderState = {
    turnOrder: undefined,
};

const turnOrderAtom = atom(initialState);

const currentTurnOrder = atom(
    (get) => {
        const currentTurnOrder = get(turnOrderAtom).turnOrder;
        const currentScene = get(sceneAtoms.getCurrentScene);
        if (!(currentScene instanceof RpgScene)) {
            return undefined;
        }

        if (currentTurnOrder === undefined) {
            return currentScene.turnOrder;
        }

        return currentTurnOrder;
    },
    (get, set) => {
        const currentScene = get(sceneAtoms.getCurrentScene);
        if (!(currentScene instanceof RpgScene)) {
            return;
        }

        const turnOrder = get(currentTurnOrder);
        if (
            turnOrder?.getUId() !== currentScene.turnOrder?.getUId() ||
            (turnOrder === undefined && currentScene.turnOrder === undefined)
        ) {
            set(turnOrderAtom, (state) => {
                state.turnOrder = currentScene.turnOrder;

                return { ...state };
            });
        }
    },
);

export const turnOrderAtoms = {
    turnOrderAtom,
    currentTurnOrder,
};
