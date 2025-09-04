import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StoreState } from "./state_store";
import { GBoard } from "../../board_core/board";
import { SceneFactory } from "../../board_core/factories/scene_factory";

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
            const scene = SceneFactory.createScene({ name });

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
        refreshScenes: (state) => {
            const currentScene = GBoard.scene;
            state.scenes = GBoard.getScenes().map((scene) => scene.name);
            if (state.currentScene === null && currentScene) {
                state.currentScene = currentScene.name;
            }
        },
    },
});

export const getScenes = (state: StoreState): string[] => {
    return state.sceneReducer.scenes;
};

export const getScene = (state: StoreState): Option<string> => {
    return state.sceneReducer.currentScene;
};
