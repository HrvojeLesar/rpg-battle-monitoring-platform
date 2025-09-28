import { GBoard, GEventEmitter } from "../../board_core/board";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { GAtomStore } from "../stores/state_store";
import { tokenAtoms } from "../stores/token_store";
import { IMessagable } from "@/board_core/interfaces/messagable";
import { TokenDataBase } from "@/board_core/token/token_data";
import { GameAssets } from "@/board_core/assets/game_assets";
import { GameAssetsFactory } from "@/board_core/factories/game_assets_factory";

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

    if (GBoard.gameAssets === undefined) {
        const gameAssets = GameAssetsFactory.createGameAssets();
        GBoard.gameAssets = gameAssets;
    }
}

function entityAdded(entity: IMessagable | IMessagable[]) {
    if (entity instanceof TokenDataBase) {
        GAtomStore.set(tokenAtoms.refreshTokens);
    }

    if (entity instanceof GameAssets) {
        GBoard.gameAssets = entity;
    }
}

export const initEventListeners = () => {
    GEventEmitter.on("board-init-started", clearScenes);
    GEventEmitter.on("board-destroyed", clearScenes);
    GEventEmitter.on("board-init-finished", refreshScenes);
    GEventEmitter.on("socket-join-finished", joinFinished);
    GEventEmitter.on("entity-added", entityAdded);
    GEventEmitter.on("entity-removed", entityAdded);
};

export const destroyEventListeners = () => {
    GEventEmitter.off("board-init-started", clearScenes);
    GEventEmitter.off("board-destroyed", clearScenes);
    GEventEmitter.off("board-init-finished", refreshScenes);
    GEventEmitter.off("socket-join-finished", joinFinished);
    GEventEmitter.off("entity-added", entityAdded);
    GEventEmitter.off("entity-removed", entityAdded);
};
