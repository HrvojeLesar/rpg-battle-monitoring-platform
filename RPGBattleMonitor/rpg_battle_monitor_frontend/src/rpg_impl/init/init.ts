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
import { GBoard } from "@/board_core/board";
import { RpgTokenFactory } from "../factories/token_factory";
import { Point } from "pixi.js";
import { RPG_TOKEN_DROP } from "../utils/rpg_token_drop";

export const initializeRPG = (entityRegistry: EntityRegistry) => {
    registerEntities(entityRegistry);
    GDragAndDropRegistry.registerHandler(RPG_TOKEN_DROP, dragAndDropHandler);
    // GHandlerRegistry.overrideHandler("drag", RpgDragHandler);
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
