import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { sceneReducer } from "./board_store";
import { useDispatch, useSelector } from "react-redux";

const rootReducer = combineSlices({
    sceneReducer: sceneReducer.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export type StoreDispatch = typeof store.dispatch;
export type StoreState = ReturnType<typeof store.getState>;

export const useStoreDispatch = useDispatch.withTypes<StoreDispatch>();
export const useStoreSelector = useSelector.withTypes<StoreState>();
