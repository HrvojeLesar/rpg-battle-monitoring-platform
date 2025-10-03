import { Box, Button, Flex, Paper } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { SceneSelection } from "./SceneSelection";
import classes from "../../../css/hud.module.css";
import { ReactNode } from "react";
import { GBoard } from "@/board_core/board";
import { Resizable } from "re-resizable";
import { SidebarTabs } from "./SidebarTabs";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { RpgTokenFactory } from "@/rpg_impl/factories/token_factory";
import { TurnOrderFactory } from "@/rpg_impl/factories/turn_order_factory";
import { RpgScene } from "@/rpg_impl/scene/scene";
import { turnOrderAtoms } from "@/rpg_impl/stores/turn_order_store";
import { RpgToken } from "@/rpg_impl/tokens/rpg_token";
import { queueEntityUpdate } from "@/websocket/websocket";
import { SelectionControls } from "../selection_controls/SelectionControls";

const SidesFlexBox = ({ children }: { children?: ReactNode }) => {
    return (
        <Flex
            direction="column"
            m="md"
            gap="xs"
            style={{
                height: "calc(100vh - (var(--mantine-spacing-md) * 2))",
                overflow: "hidden",
            }}
        >
            {children}
        </Flex>
    );
};

const HudLeft = () => {
    const currentScene = useAtomValue(sceneAtoms.getCurrentScene);
    const currentSceneLayer = useAtomValue(sceneAtoms.getCurrentSceneLayer);
    const refreshScenes = useSetAtom(sceneAtoms.refreshScenes);
    const { turnOrder } = useAtomValue(turnOrderAtoms.currentTurnOrder);

    const addTokenButton = () => {
        if (!currentScene) {
            return <></>;
        }

        return (
            <Button
                style={{
                    pointerEvents: "all",
                }}
                onClick={() => {
                    // TokenFactory.createRandomToken(currentScene);
                    RpgTokenFactory.createRandomToken(currentScene);
                }}
            >
                Add token to scene
            </Button>
        );
    };

    const addLayerSwitchButton = () => {
        if (!currentScene) {
            return <></>;
        }

        return (
            <Button
                style={{
                    pointerEvents: "all",
                }}
                onClick={() => {
                    const selectedLayer = GBoard.scene?.selectedLayer;
                    if (selectedLayer?.name === "gridBackground") {
                        GBoard.scene?.selectLayer("token");
                    } else if (selectedLayer?.name === "token") {
                        GBoard.scene?.selectLayer("grid");
                    } else if (selectedLayer?.name === "grid") {
                        GBoard.scene?.selectLayer("gridBackground");
                    } else {
                        GBoard.scene?.selectLayer("token");
                    }

                    refreshScenes();
                }}
            >
                Switch layer events (Current layer:
                {currentSceneLayer?.name})
            </Button>
        );
    };

    const addTurnOrderButton = () => {
        if (!currentScene || !(currentScene instanceof RpgScene)) {
            return <></>;
        }

        return (
            <Button
                style={{
                    pointerEvents: "all",
                }}
                onClick={() => {
                    TurnOrderFactory.create(currentScene);
                }}
            >
                Add turn order to current scene {turnOrder?.getUId()}
            </Button>
        );
    };

    const addSelectionToTurnOrder = () => {
        if (!turnOrder || !currentScene) {
            return <></>;
        }

        return (
            <Flex gap="xs">
                <Button
                    flex={1}
                    style={{
                        pointerEvents: "all",
                    }}
                    onClick={() => {
                        const selections =
                            currentScene.selectHandler.selections.reduce<
                                RpgToken[]
                            >((acc, selection) => {
                                if (selection instanceof RpgToken) {
                                    acc.push(selection);
                                }

                                return acc;
                            }, []);

                        turnOrder.addToken(selections);

                        queueEntityUpdate(() => {
                            return turnOrder;
                        });
                    }}
                >
                    Add selection to turn order
                </Button>
                <Button
                    flex={1}
                    style={{
                        pointerEvents: "all",
                    }}
                    onClick={() => {
                        turnOrder.startCombat();

                        queueEntityUpdate(() => {
                            return turnOrder;
                        });
                    }}
                >
                    Start combat
                </Button>
                <Button
                    flex={1}
                    style={{
                        pointerEvents: "all",
                    }}
                    onClick={() => {
                        turnOrder.stopCombat();

                        queueEntityUpdate(() => {
                            return turnOrder;
                        });
                    }}
                >
                    Stop combat
                </Button>
                <Button
                    flex={1}
                    style={{
                        pointerEvents: "all",
                    }}
                    onClick={() => {
                        turnOrder.nextTurn();

                        queueEntityUpdate(() => {
                            return turnOrder;
                        });
                    }}
                >
                    Next turn
                </Button>
            </Flex>
        );
    };

    const focusOnSelection = () => {
        if (!currentScene) {
            return <></>;
        }

        return (
            <Button
                style={{
                    pointerEvents: "all",
                }}
                onClick={() => {
                    const selection =
                        currentScene.selectHandler.selections.at(0);

                    if (selection === undefined) {
                        return;
                    }

                    const pos = selection.position.clone();
                    const width = selection.width;
                    const height = selection.height;
                    if (
                        pos === undefined ||
                        width === undefined ||
                        height === undefined
                    ) {
                        return;
                    }

                    pos.set(pos.x + width / 2, pos.y + height / 2);

                    currentScene.viewport.moveCenter(pos);
                }}
            >
                Focus on selection
            </Button>
        );
    };

    const inRange = () => {
        if (!(currentScene instanceof RpgScene)) {
            return <></>;
        }

        return (
            <Button
                style={{
                    pointerEvents: "all",
                }}
                onClick={() => {
                    const token = currentScene.selectHandler.selections.at(0);
                    if (token instanceof RpgToken) {
                        currentScene.inRangeHandler.highlightTokensInRange(
                            token,
                            1,
                        );
                    }
                }}
            >
                Highlight in range
            </Button>
        );
    };

    return (
        <SidesFlexBox>
            <Flex direction="column" gap="xs" style={{ overflow: "auto" }}>
                <SceneSelection />
                {addTokenButton()}
                {addLayerSwitchButton()}
                {addTurnOrderButton()}
                {addSelectionToTurnOrder()}
                {focusOnSelection()}
                <SelectionControls>
                    <SelectionControls.DeleteSelection />
                    <SelectionControls.ContainerProperties />
                </SelectionControls>
                {inRange()}
            </Flex>
        </SidesFlexBox>
    );
};

const HudFiller = () => {
    return <div></div>;
};

const HudRight = () => {
    return (
        <SidesFlexBox>
            <Resizable
                style={{
                    pointerEvents: "all",
                }}
                defaultSize={{
                    width: 300,
                }}
                enable={{
                    top: false,
                    right: true,
                    bottom: false,
                    left: true,
                    topRight: false,
                    bottomRight: false,
                    bottomLeft: false,
                    topLeft: false,
                }}
            >
                <Paper
                    p="xs"
                    style={{
                        height: "calc(100vh - (var(--mantine-spacing-md) * 2))",
                        overflow: "auto",
                    }}
                >
                    <SidebarTabs />
                </Paper>
            </Resizable>
        </SidesFlexBox>
    );
};

export const Hud = () => {
    return (
        <Box className={classes.hud}>
            <HudLeft />
            <HudFiller />
            <HudRight />
        </Box>
    );
};
