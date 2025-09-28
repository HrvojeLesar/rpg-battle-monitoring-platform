import { GEventEmitter } from "../../board_core/board";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { GAtomStore } from "../stores/state_store";
import { tokenAtoms } from "../stores/token_store";
import { IMessagable } from "@/board_core/interfaces/messagable";
import { TokenDataBase } from "@/board_core/token/token_data";

function clearScenes() {
    GAtomStore.set(sceneAtoms.clearScenes);
}

function refreshScenes() {
    GAtomStore.set(sceneAtoms.refreshScenes);
}

function joinFinished() {
    refreshScenes();
    const scenes = GAtomStore.get(sceneAtoms.getScenes);
    const firstScene = scenes.at(0);
    GAtomStore.set(sceneAtoms.changeScene, firstScene);
}

function refreshTokens(entity: IMessagable | IMessagable[]) {
    if (entity instanceof TokenDataBase) {
        GAtomStore.set(tokenAtoms.refreshTokens);
    }
}

export const initEventListeners = () => {
    GEventEmitter.on("board-init-started", clearScenes);
    GEventEmitter.on("board-destroyed", clearScenes);
    GEventEmitter.on("board-init-finished", refreshScenes);
    GEventEmitter.on("socket-join-finished", joinFinished);
    GEventEmitter.on("entity-added", refreshTokens);
    GEventEmitter.on("entity-removed", refreshTokens);
};

export const destroyEventListeners = () => {
    GEventEmitter.off("board-init-started", clearScenes);
    GEventEmitter.off("board-destroyed", clearScenes);
    GEventEmitter.off("board-init-finished", refreshScenes);
    GEventEmitter.off("socket-join-finished", joinFinished);
    GEventEmitter.off("entity-added", refreshTokens);
    GEventEmitter.off("entity-removed", refreshTokens);
};
