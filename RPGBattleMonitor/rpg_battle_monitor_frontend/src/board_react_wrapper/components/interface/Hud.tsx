import { Box, Button, Flex, Paper } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { SceneSelection } from "./SceneSelection";
import classes from "../../../css/hud.module.css";
import { ReactNode } from "react";
import { Resizable } from "re-resizable";
import { SidebarTabs } from "./SidebarTabs";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { RpgScene } from "@/rpg_impl/scene/scene";
import { SelectionControls } from "../selection_controls/SelectionControls";
import { LayerSelect } from "./LayerSelect";
import { windowAtoms } from "@/board_react_wrapper/stores/window_store";
import { openDiceRollWindow } from "@/rpg_impl/components/windows/DiceRollWindow";

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

                    // @ts-ignore
                    selection.getOccupiedCells();

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

    const switchViewportDragging = () => {
        if (!(currentScene instanceof RpgScene)) {
            return <></>;
        }

        return (
            <>
                <Button
                    style={{
                        pointerEvents: "all",
                    }}
                    onClick={() => {
                        currentScene.freeDrag();
                    }}
                >
                    Free drag
                </Button>
                <Button
                    style={{
                        pointerEvents: "all",
                    }}
                    onClick={() => {
                        currentScene.dragWithSelectionBox();
                    }}
                >
                    With selection box
                </Button>
            </>
        );
    };

    const openWindow = useSetAtom(windowAtoms.openWindow);
    const diceRollWindow = () => {
        return (
            <>
                <Button
                    style={{
                        pointerEvents: "all",
                    }}
                    onClick={() => {
                        openWindow(openDiceRollWindow());
                    }}
                >
                    Dice roll
                </Button>
            </>
        );
    };

    return (
        <SidesFlexBox>
            <Flex direction="column" gap="xs" style={{ overflow: "auto" }}>
                <SceneSelection />
                <LayerSelect />
                {focusOnSelection()}
                <SelectionControls>
                    <SelectionControls.DeleteSelection />
                    <SelectionControls.ContainerProperties />
                </SelectionControls>
                {switchViewportDragging()}
                {diceRollWindow()}
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
                    width: 400,
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
