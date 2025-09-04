import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StoreState } from "./state_store";

type GameReducerState = {
    gameId: Option<number>;
};

const initialState: GameReducerState = {
    gameId: undefined,
};

export const gameReducer = createSlice({
    name: "game",
    initialState,
    reducers: {
        setGameId: (state, action: PayloadAction<Option<number>>) => {
            state.gameId = action.payload;
        },
    },
});

export const getGameId = (state: StoreState): Option<number> => {
    return state.gameReducer.gameId;
};
