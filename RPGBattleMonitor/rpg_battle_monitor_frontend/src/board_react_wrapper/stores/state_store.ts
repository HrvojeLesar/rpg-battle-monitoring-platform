import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { sceneReducer } from "./board_store";
import { useDispatch, useSelector } from "react-redux";
import { gameReducer } from "./game_store";
import { boardEventMiddleware } from "../middleware/board_event_middleware";

const rootReducer = combineSlices({
    sceneReducer: sceneReducer.reducer,
    gameReducer: gameReducer.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(boardEventMiddleware);
    },
});

export type StoreDispatch = typeof store.dispatch;
export type StoreState = ReturnType<typeof rootReducer>;

export const useStoreDispatch = useDispatch.withTypes<StoreDispatch>();
export const useStoreSelector = useSelector.withTypes<StoreState>();
