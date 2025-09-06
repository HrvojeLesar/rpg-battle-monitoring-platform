import { GBoard } from "../../board_core/board";
import { SceneFactory } from "../../board_core/factories/scene_factory";
import { Scene } from "../../board_core/scene";
import { atom } from "jotai";

export type sceneReducerState = {
    scenes: Scene[];
    currentScene: Maybe<Scene>;
};

const initialState: sceneReducerState = {
    scenes: [],
    currentScene: undefined,
};

const sceneAtom = atom(initialState);

const getScenes = atom((get) => {
    return get(sceneAtom).scenes;
});

const getCurrentScene = atom((get) => {
    return get(sceneAtom).currentScene;
});

const addScene = atom(null, (_, set, name: string) => {
    const scene = GBoard.entityRegistry.createEntity(
        SceneFactory.createScene({ name }),
    );

    set(sceneAtom, (state) => {
        state.scenes = [...state.scenes, scene];

        return { ...state };
    });
});

const changeScene = atom(null, (_, set, scene: Scene) => {
    GBoard.changeScene(scene);

    set(sceneAtom, (state) => {
        state.currentScene = scene;

        return { ...state };
    });
});

const clearScenes = atom(null, (_, set) => {
    set(sceneAtom, (state) => {
        state.scenes = [];
        state.currentScene = undefined;

        return { ...state };
    });
});

const refreshScenes = atom(null, (_, set) => {
    set(sceneAtom, (state) => {
        const currentScene = GBoard.scene;

        state.scenes = [...GBoard.scenes];

        if (state.currentScene === null && currentScene) {
            state.currentScene = currentScene;
        }

        return { ...state };
    });
});

export const sceneAtoms = {
    sceneAtom,
    getScenes,
    getCurrentScene,
    addScene,
    changeScene,
    clearScenes,
    refreshScenes,
};
