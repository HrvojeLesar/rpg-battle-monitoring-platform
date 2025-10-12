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
import { RPG_ASSET_DROP, RPG_TOKEN_DROP } from "../utils/rpg_token_drop";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { sidebarTabAtoms } from "@/board_react_wrapper/stores/sidebar_tab_store";
import {
    TokenIcon,
    Tokens,
} from "@/board_react_wrapper/components/interface/Tokens";
import {
    TurnOrder as TurnOrderComponent,
    TurnOrderIcon,
} from "../components/TurnOrder";
import { AssetIcon, RPGAssetUpload } from "../components/Assets/Upload";
import { DecorationToken } from "../tokens/decoration_token";
import { DecorationTokenConverter } from "../converters/decoration_token_coverter";
import { DecorationTokenFactory } from "../factories/decoration_token_factory";
import { DecorationTokenData } from "../tokens/decoration_token_data";
import { DecorationTokenDataConverter } from "../converters/decoration_token_data_converter";
import { Asset } from "@/board_core/assets/game_assets";
import { GTokenWindowRegistry } from "../registry/token_window_registry";
import { windowAtoms } from "@/board_react_wrapper/stores/window_store";
import { openDecorationTokenWindow } from "../components/windows/DecorationTokenWindow";
import { openRpgTokenWindow } from "../components/windows/RpgTokenWindow";
import { TokenAttributes } from "@/board_core/token/token";
import { TypedJson } from "@/board_core/interfaces/messagable";

export const initializeRPG = (entityRegistry: EntityRegistry) => {
    registerEntities(entityRegistry);
    GDragAndDropRegistry.registerHandler(RPG_TOKEN_DROP, dragAndDropHandler);
    GDragAndDropRegistry.registerHandler(RPG_ASSET_DROP, assetDropHandler);
    // GHandlerRegistry.overrideHandler("drag", RpgDragHandler);
    GEventEmitter.on("socket-join-finished", socketJoinFinishedListener);
    GEventEmitter.once("board-destroyed", () => {
        GEventEmitter.off("socket-join-finished", socketJoinFinishedListener);
    });

    GEventEmitter.on("entity-updated", (entity, oldData, newData) => {
        if (
            entity instanceof RpgToken &&
            oldData !== undefined &&
            newData !== undefined
        ) {
            animateTokenMoves(
                entity,
                oldData as TokenAttributes,
                newData as TypedJson<TokenAttributes>,
            );
        }
    });

    GTokenWindowRegistry.registerHandler((token) => {
        if (token instanceof DecorationTokenData) {
            GAtomStore.set(
                windowAtoms.openWindow,
                openDecorationTokenWindow(token),
            );
        }
    }, DecorationTokenData);

    GTokenWindowRegistry.registerHandler((token) => {
        if (token instanceof RpgTokenData) {
            GAtomStore.set(windowAtoms.openWindow, openRpgTokenWindow(token));
        }
    }, RpgTokenData);
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
    registry.registeredEntityKinds.register(
        DecorationTokenData.getKindStatic(),
        DecorationTokenDataConverter.convert,
    );
    registry.registeredEntityKinds.register(
        DecorationToken.getKindStatic(),
        DecorationTokenConverter.convert,
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

const assetDropHandler = (event: DragEvent, assetDataJson: string) => {
    let assetData;
    try {
        assetData = JSON.parse(assetDataJson) as Asset;
    } catch (e) {
        console.error(e);
        return;
    }

    const screenPoint = new Point(event.x, event.y);
    const localPoint = GBoard.viewport.toLocal(screenPoint);
    const scene = GBoard.scene;
    if (scene) {
        DecorationTokenFactory.create(scene, assetData, localPoint);
    }
};

const socketJoinFinishedListener = () => {
    // TODO: Next line disallows sidebar tabs from outside this module
    // better solution would be to try to replace tab when adding it if it already exists
    GAtomStore.set(sidebarTabAtoms.resetTabs);

    GAtomStore.set(sidebarTabAtoms.addTab, {
        value: "Turn order",
        title: "Turn order",
        icon: TurnOrderIcon,
        content: TurnOrderComponent,
    });

    GAtomStore.set(sidebarTabAtoms.addTab, {
        value: "Token Data",
        title: "Token Data",
        icon: TokenIcon,
        content: Tokens,
    });

    GAtomStore.set(sidebarTabAtoms.addTab, {
        value: "Assets",
        title: "Assets",
        icon: AssetIcon,
        content: RPGAssetUpload,
    });

    // GAtomStore.set(sidebarTabAtoms.addTab, {
    //     value: "Turn order",
    //     title: "Turn order",
    //     icon: TokenIcon,
    //     content: TurnOrderComponent,
    // });
};

const animateTokenMoves = (
    token: RpgToken,
    oldData: TokenAttributes,
    newData: TypedJson<TokenAttributes>,
) => {
    const oldPosition = new Point(oldData.position.x, oldData.position.y);
    token.position.set(oldPosition.x, oldPosition.y);

    token.animator.animateMove(
        token,
        new Point(newData.position.x, newData.position.y),
    );
};
