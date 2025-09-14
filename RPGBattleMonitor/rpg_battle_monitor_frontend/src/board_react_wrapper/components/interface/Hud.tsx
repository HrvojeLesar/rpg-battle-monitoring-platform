import { Box, Button } from "@mantine/core";
import classes from "../../../css/hud.module.css";
import { TokenFactory } from "../../../board_core/factories/token_factory";
import { useAtomValue } from "jotai";
import { sceneAtoms } from "../../stores/board_store";
import { SceneSelection } from "./SceneSelection";

export const Hud = () => {
    const currentScene = useAtomValue(sceneAtoms.getCurrentScene);

    const addTokenButton = () => {
        if (!currentScene) {
            return <></>;
        }

        return (
            <Button
                onClick={() => {
                    TokenFactory.createToken(currentScene);
                }}
            >
                Add token to scene
            </Button>
        );
    };
    return (
        <Box className={classes.hud}>
            <SceneSelection />
            {addTokenButton()}
        </Box>
    );
};
