import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StoreState } from "./state_store";

type GameReducerState = {
    gameId: Option<number>;
};

const fetchGameIdFromLocalStorage = () => {
    const gameId = localStorage.getItem("gameId")
        ? Number(localStorage.getItem("gameId"))
        : undefined;

    if (gameId === undefined || isNaN(gameId) || !isFinite(gameId)) {
        return undefined;
    }

    return gameId;
};

const initialState: GameReducerState = {
    gameId: fetchGameIdFromLocalStorage(),
};

export const gameReducer = createSlice({
    name: "game",
    initialState,
    reducers: {
        setGameId: (state, action: PayloadAction<Option<number>>) => {
            localStorage.setItem("gameId", String(action.payload));
            state.gameId = action.payload;
        },
    },
});

export const getGameId = (state: StoreState): Option<number> => {
    return state.gameReducer.gameId;
};
