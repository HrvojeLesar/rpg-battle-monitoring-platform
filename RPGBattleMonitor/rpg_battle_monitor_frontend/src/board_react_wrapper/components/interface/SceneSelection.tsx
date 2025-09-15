import { useAtomValue, useSetAtom } from "jotai";
import { sceneAtoms } from "../../stores/board_store";
import {
    ActionIcon,
    Button,
    ComboboxData,
    Flex,
    Select,
    Tooltip,
} from "@mantine/core";
import { sceneAtomsUtils } from "../../stores/utils";
import { GBoard } from "../../../board_core/board";
import { Scene } from "../../../board_core/scene";
import { GridSettings } from "../GridSettings";
import { IconSettings } from "@tabler/icons-react";

export const SceneSelection = () => {
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

    const sceneData = (): ComboboxData => {
        return scenes.map((scene) => {
            return {
                value: scene.getUId(),
                label: scene.name,
            };
        });
    };

    return (
        <Flex direction="row" gap="xs" align="center">
            <Select
                data={sceneData()}
                value={currentScene?.getUId()}
                onChange={(value) => {
                    if (value) {
                        const scene = GBoard.entityRegistry.entities.get(value);
                        if (scene instanceof Scene) {
                            changeScene(scene);
                        }
                    }
                }}
            />
            <Button
                onClick={() => {
                    createScene({
                        name: `test-scene${scenes.length + 1}`,
                        sortPositionFunc: sceneAtomsUtils.getNextSortPosition,
                    });
                }}
            >
                Add scene
            </Button>
            <Button
                onClick={() => {
                    if (currentScene) {
                        removeScene(currentScene);
                    }
                }}
            >
                Remove current scene
            </Button>
            <Tooltip label="Scene settings">
                <ActionIcon>
                    <IconSettings />
                </ActionIcon>
            </Tooltip>
        </Flex>
    );
};
