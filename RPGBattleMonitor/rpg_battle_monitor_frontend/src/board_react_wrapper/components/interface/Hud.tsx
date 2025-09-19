import { Box, Button, Flex } from "@mantine/core";
import { TokenFactory } from "../../../board_core/factories/token_factory";
import { useAtomValue } from "jotai";
import { sceneAtoms } from "../../stores/board_store";
import { SceneSelection } from "./SceneSelection";
import classes from "../../../css/hud.module.css";
import { ReactNode } from "react";

const SidesFlexBox = ({ children }: { children?: ReactNode }) => {
    return (
        <Flex
            direction="column"
            m="md"
            gap="xs"
            style={{ pointerEvents: "all" }}
        >
            {children}
        </Flex>
    );
};

const HudLeft = () => {
    const currentScene = useAtomValue(sceneAtoms.getCurrentScene);

    const addTokenButton = () => {
        if (!currentScene) {
            return <></>;
        }

        return (
            <Button
                onClick={() => {
                    TokenFactory.createRandomToken(currentScene);
                }}
            >
                Add token to scene
            </Button>
        );
    };

    return (
        <SidesFlexBox>
            <SceneSelection />
            {addTokenButton()}
        </SidesFlexBox>
    );
};

const HudFiller = () => {
    return <div></div>;
};

const HudRight = () => {
    return <SidesFlexBox></SidesFlexBox>;
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
