import { GBoard } from "../../board_core/board";
import { SceneFactory } from "../../board_core/factories/scene_factory";
import { Scene, SceneOptions } from "../../board_core/scene";
import { atom } from "jotai";

export type SceneReducerState = {
    scenes: Scene[];
    currentScene: Maybe<Scene>;
};

const initialState: SceneReducerState = {
    scenes: [],
    currentScene: undefined,
};

const sortedScenes = (scenes: Scene[]): Scene[] => {
    scenes.sort((a, b) => {
        const aPosition = a.sortPosition;
        const bPosition = b.sortPosition;
        if (aPosition !== undefined && bPosition !== undefined) {
            return aPosition > bPosition ? 1 : -1;
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

export type SceneOptionsExt = {
    sortPositionFunc?: () => Maybe<number>;
} & SceneOptions;

const createScene = atom(null, (_, set, options: SceneOptionsExt) => {
    const sceneSortPosition =
        options.sortPosition ??
        (options.sortPositionFunc && options.sortPositionFunc());
    const scene = SceneFactory.createScene({
        ...options,
        sortPosition: sceneSortPosition,
    });

    set(sceneAtom, (state) => {
        const scenes = [...state.scenes, scene];

        state.scenes = sortedScenes(scenes);

        return { ...state };
    });
});

const changeScene = atom(null, (_, set, scene: Maybe<Scene>) => {
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
        const currentScene = state.currentScene;

        state.scenes = sortedScenes([...state.scenes]);

        if (state.currentScene === null && currentScene) {
            state.currentScene = currentScene;
        }

        return { ...state };
    });
});

const removeScene = atom(null, (_, set, scene: Scene) => {
    const deleteAction = GBoard.entityRegistry.entities.remove(scene);

    for (const entity of deleteAction.acc) {
        GBoard.websocket.queue(entity, "deleteQueue");
    }

    GBoard.websocket.flush();

    deleteAction.cleanupCallbacks.forEach((cb) => cb());

    set(sceneAtom, (state) => {
        state.scenes = state.scenes.filter(
            (s) => s.getUId() !== scene.getUId(),
        );

        if (state.currentScene?.getUId() === scene.getUId()) {
            set(changeScene, state.scenes[0] ?? undefined);
        }

        return { ...state };
    });
});

const addScene = atom(null, (_, set, scene: Scene) => {
    set(sceneAtom, (state) => {
        const scenes = [...state.scenes, scene];

        state.scenes = sortedScenes(scenes);

        return { ...state };
    });
});

export const sceneAtoms = {
    sceneAtom,
    getScenes,
    getCurrentScene,
    createScene,
    changeScene,
    clearScenes,
    refreshScenes,
    removeScene,
    addScene,
};
