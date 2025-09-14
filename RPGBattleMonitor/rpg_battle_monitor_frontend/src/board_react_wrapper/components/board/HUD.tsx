import { Box, Button } from "@mantine/core";
import classes from "../../../css/hud.module.css";
import { Resizable } from "re-resizable";
import { GridSettings } from "../GridSettings";
import { TokenFactory } from "../../../board_core/factories/token_factory";
import { useAtomValue, useSetAtom } from "jotai";
import { sceneAtoms } from "../../stores/board_store";

export const HUD = () => {
    const scenes = useAtomValue(sceneAtoms.getScenes);
    const changeScene = useSetAtom(sceneAtoms.changeScene);
    const currentScene = useAtomValue(sceneAtoms.getCurrentScene);
    const createScene = useSetAtom(sceneAtoms.createScene);
    const removeScene = useSetAtom(sceneAtoms.removeScene);

    const gridSettings = () => {
        if (!currentScene) {
            return <></>;
        }

        return (
            <>
                <GridSettings grid={currentScene.grid} />
            </>
        );
    };

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
            <Button
                onClick={() => {
                    createScene({
                        name: `test-scene${scenes.length + 1}`,
                    });
                }}
            >
                Add scene
            </Button>
            {addTokenButton()}
            {scenes.map((scene, idx) => {
                return (
                    <Button
                        key={idx}
                        onClick={() => {
                            changeScene(scene);
                        }}
                    >
                        {scene.name}
                    </Button>
                );
            })}
            {gridSettings()}
            <Button
                onClick={() => {
                    if (currentScene) {
                        removeScene(currentScene);
                    }
                }}
            >
                Remove current scene
            </Button>
        </Box>
    );
};
