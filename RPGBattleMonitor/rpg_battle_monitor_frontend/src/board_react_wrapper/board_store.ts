import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Scene } from "../board_core/scene";
import { GBoard } from "../board_core/board";
import { useDispatch, useSelector } from "react-redux";

function loadSceneNames(): string[] {
    const scenes = GBoard.getScenes().map((scene) => scene.name);

    return scenes;
}

export const sceneReducer = createSlice({
    name: "scenes",
    initialState: {
        scenes: loadSceneNames() as string[],
        currentScene: null as string | null,
    },
    reducers: {
        addScene: (state, action: PayloadAction<string>) => {
            const name = action.payload;
            const scene = new Scene(name);
            GBoard.addScene(scene);

            state.scenes.push(name);
        },
        changeScene: (state, action: PayloadAction<string>) => {
            const sceneName = action.payload;
            const scene = GBoard.getSceneByName(sceneName);
            if (scene) {
                GBoard.changeScene(scene);
                state.currentScene = action.payload;
            }
        },
        clearScenes: (state) => {
            state.scenes = [];
            state.currentScene = null;
        },
    },
});

type StoreDispatch = typeof store.dispatch;
type StoreState = ReturnType<typeof store.getState>;

export const store = configureStore({
    reducer: sceneReducer.reducer,
});

export const useStoreDispatch = useDispatch.withTypes<StoreDispatch>();
export const useStoreSelector = useSelector.withTypes<StoreState>();

export const getScenes = (state: StoreState) => {
    return state.scenes;
};
