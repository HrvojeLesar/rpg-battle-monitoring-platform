import { GEventEmitter } from "../../board_core/board";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { GAtomStore } from "../stores/state_store";

export const initEventListeners = () => {
    GEventEmitter.on("board-init-started", () => {
        GAtomStore.set(sceneAtoms.clearScenes);
    });

    GEventEmitter.on("board-init-finished", () => {
        GAtomStore.set(sceneAtoms.refreshScenes);
    });

    GEventEmitter.on("board-destoryed", () => {
        GAtomStore.set(sceneAtoms.clearScenes);
    });

    GEventEmitter.on("socket-join-finished", () => {
        GAtomStore.set(sceneAtoms.refreshScenes);
        const scenes = GAtomStore.get(sceneAtoms.getScenes);
        const firstScene = scenes.at(0);
        GAtomStore.set(sceneAtoms.changeScene, firstScene);
    });
};
