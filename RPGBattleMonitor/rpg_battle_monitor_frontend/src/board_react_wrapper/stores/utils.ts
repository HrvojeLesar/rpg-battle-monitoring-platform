import { sceneAtoms } from "./board_store";
import { GAtomStore } from "./state_store";

const getNextSortPosition = () => {
    const scenes = GAtomStore.get(sceneAtoms.getScenes);
    const maxSortPosition = scenes.reduce<Maybe<number>>((acc, scene) => {
        if (acc === undefined) {
            return scene.sortPosition;
        }

        if (scene.sortPosition && scene.sortPosition > acc) {
            acc = scene.sortPosition;
        }

        return acc;
    }, undefined);

    if (maxSortPosition !== undefined) {
        return maxSortPosition + 1;
    }

    return 0;
};

export const sceneAtomsUtils = {
    getNextSortPosition,
};
