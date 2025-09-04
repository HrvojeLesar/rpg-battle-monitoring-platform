import {
    Dispatch,
    Middleware,
    MiddlewareAPI,
    UnknownAction,
} from "@reduxjs/toolkit";
import { StoreState } from "../stores/state_store";
import { GEventEmitter } from "../../board_core/board";
import { sceneReducer } from "../stores/board_store";

export type StoreStateDispatch = MiddlewareAPI<
    Dispatch<UnknownAction>,
    StoreState
>;

export const boardEventMiddleware: Middleware<object, StoreState> = (store) => {
    GEventEmitter.on("board-init-started", () => {
        handleBoardInitStartedEvent(store);
    });

    GEventEmitter.on("board-init-finished", () => {
        handleBoardInitFinishedEvent(store);
    });

    GEventEmitter.on("board-destoryed", () => {
        handleBoardDestoryedEvent(store);
    });

    return (next) => (action) => next(action);
};

const handleBoardInitStartedEvent = (store: StoreStateDispatch) => {
    store.dispatch(sceneReducer.actions.clearScenes());
};

const handleBoardInitFinishedEvent = (store: StoreStateDispatch) => {
    store.dispatch(sceneReducer.actions.refreshScenes());
};

const handleBoardDestoryedEvent = (store: StoreStateDispatch) => {
    store.dispatch(sceneReducer.actions.clearScenes());
};
