import { ContainerExtension } from "@/board_core/extensions/container_extension";
import { atomWithRefresh } from "jotai/utils";
import { sceneAtoms } from "./scene_store";

export type SelectState = {
    selections: ContainerExtension[];
};

// @ts-ignore
const initialState: SelectState = {
    selections: [],
};

const selections = atomWithRefresh<ContainerExtension[]>((get) => {
    const currentScene = get(sceneAtoms.getCurrentScene);
    if (currentScene === undefined) {
        return [];
    }

    return [...currentScene.selectHandler.selections];
});

export const selectAtoms = {
    selections,
};
