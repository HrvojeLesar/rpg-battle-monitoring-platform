import {
    sceneAtoms,
    SceneOptionsExt,
    sortedScenes,
} from "@/board_react_wrapper/stores/scene_store";
import { RpgSceneFactory } from "../factories/rpg_scene_factory";
import { atom } from "jotai";

const createScene = atom(null, (_, set, options: SceneOptionsExt) => {
    const sceneSortPosition =
        options.sortPosition ??
        (options.sortPositionFunc && options.sortPositionFunc());
    const scene = RpgSceneFactory.createScene({
        ...options,
        sortPosition: sceneSortPosition,
    });

    set(sceneAtoms.sceneAtom, (state) => {
        const scenes = [...state.scenes, scene];

        state.scenes = sortedScenes(scenes);

        return { ...state };
    });
});

export const sceneAtomsExt = {
    ...sceneAtoms,
    createScene,
};
