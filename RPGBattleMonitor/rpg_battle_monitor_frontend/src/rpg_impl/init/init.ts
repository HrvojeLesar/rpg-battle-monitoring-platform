import { EntityRegistry } from "@/board_core/registry/entity_registry";
import { RpgScene } from "../scene/scene";
import { RpgSceneConverter } from "../converters/rpg_scene_converter";
import { RpgTokenData } from "../tokens/rpg_token_data";
import { RpgTokenDataConverter } from "../converters/rpg_token_data_converter";
import { RpgToken } from "../tokens/rpg_token";
import { RpgTokenConverter } from "../converters/rpg_token_coverter";
import { TurnOrder } from "../turn/turn_order";
import { TurnOrderConverter } from "../converters/turn_order_converter";
import { GDragAndDropRegistry } from "@/board_core/registry/drag_and_drop_registry";
import { GBoard, GEventEmitter } from "@/board_core/board";
import { RpgTokenFactory } from "../factories/token_factory";
import { Point } from "pixi.js";
import { RPG_TOKEN_DROP } from "../utils/rpg_token_drop";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { sidebarTabAtoms } from "@/board_react_wrapper/stores/sidebar_tab_store";
import {
    TokenIcon,
    Tokens,
} from "@/board_react_wrapper/components/interface/Tokens";
import { TurnOrder as TurnOrderComponent } from "../components/TurnOrder";
import { RPGAssetUpload } from "../components/Assets/Upload";

export const initializeRPG = (entityRegistry: EntityRegistry) => {
    registerEntities(entityRegistry);
    GDragAndDropRegistry.registerHandler(RPG_TOKEN_DROP, dragAndDropHandler);
    // GHandlerRegistry.overrideHandler("drag", RpgDragHandler);
    GEventEmitter.on("socket-join-finished", socketJoinFinishedListener);
    GEventEmitter.once("board-destroyed", () => {
        GEventEmitter.off("socket-join-finished", socketJoinFinishedListener);
    });
};

const registerEntities = (registry: EntityRegistry) => {
    registry.registeredEntityKinds.register(
        RpgScene.getKindStatic(),
        RpgSceneConverter.convert,
    );
    registry.registeredEntityKinds.register(
        RpgTokenData.getKindStatic(),
        RpgTokenDataConverter.convert,
    );
    registry.registeredEntityKinds.register(
        RpgToken.getKindStatic(),
        RpgTokenConverter.convert,
    );
    registry.registeredEntityKinds.register(
        TurnOrder.getKindStatic(),
        TurnOrderConverter.convert,
    );
};

const dragAndDropHandler = (event: DragEvent, data: string) => {
    if (data.length === 0) {
        return;
    }

    const screenPoint = new Point(event.x, event.y);
    const localPoint = GBoard.viewport.toLocal(screenPoint);
    const tokendata = GBoard.entityRegistry.entities.get(data);
    const scene = GBoard.scene;
    if (scene && tokendata && tokendata instanceof RpgTokenData) {
        RpgTokenFactory.createRandomToken(scene, tokendata, localPoint);
    }
};

const socketJoinFinishedListener = () => {
    // TODO: Next line disallows sidebar tabs from outside this module
    // better solution would be to try to replace tab when adding it if it already exists
    GAtomStore.set(sidebarTabAtoms.resetTabs);

    GAtomStore.set(sidebarTabAtoms.addTab, {
        value: "Assets",
        title: "Assets",
        icon: TokenIcon,
        content: RPGAssetUpload,
    });
    GAtomStore.set(sidebarTabAtoms.addTab, {
        value: "Token Data",
        title: "Token Data",
        icon: TokenIcon,
        content: Tokens,
    });

    GAtomStore.set(sidebarTabAtoms.addTab, {
        value: "Turn order",
        title: "Turn order",
        icon: TokenIcon,
        content: TurnOrderComponent,
    });
};
