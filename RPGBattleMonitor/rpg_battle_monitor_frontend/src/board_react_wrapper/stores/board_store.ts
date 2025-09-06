import { GBoard } from "../../board_core/board";
import { SceneFactory } from "../../board_core/factories/scene_factory";
import { Scene, SceneOptions } from "../../board_core/scene";
import { atom } from "jotai";

export type sceneReducerState = {
    scenes: Scene[];
    currentScene: Maybe<Scene>;
};

const initialState: sceneReducerState = {
    scenes: [],
    currentScene: undefined,
};

const sortedScenes = (scenes: Scene[]): Scene[] => {
    scenes.sort((a, b) => {
        const aPosition = a.sortPosition;
        const bPosition = b.sortPosition;
        if (aPosition && bPosition) {
            return aPosition - bPosition;
        }

        return 0;
    });

    return scenes;
};

const sceneAtom = atom(initialState);

const getScenes = atom((get) => {
    return get(sceneAtom).scenes;
});

const getCurrentScene = atom((get) => {
    return get(sceneAtom).currentScene;
});

const addScene = atom(null, (get, set, options: SceneOptions) => {
    function getNextSortPosition(): Maybe<number> {
        const scenes = get(getScenes);
        const maxSortPosition = scenes.reduce<Maybe<number>>((acc, scene) => {
            if (acc === undefined) {
                return scene.sortPosition;
            }

            if (scene.sortPosition && scene.sortPosition > acc) {
                acc = scene.sortPosition;
            }

            return acc;
        }, undefined);

        if (maxSortPosition) {
            return maxSortPosition + 1;
        }

        return maxSortPosition;
    }

    const sceneSortPosition = options.sortPosition ?? getNextSortPosition();
    const scene = GBoard.entityRegistry.createEntity(
        SceneFactory.createScene({
            ...options,
            sortPosition: sceneSortPosition,
        }),
    );

    set(sceneAtom, (state) => {
        const scenes = [...state.scenes, scene];

        state.scenes = sortedScenes(scenes);

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

        state.scenes = sortedScenes([...GBoard.scenes]);

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
