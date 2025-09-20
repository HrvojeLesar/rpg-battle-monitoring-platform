import { useAtomValue, useSetAtom } from "jotai";
import { ActionIcon, ComboboxData, Flex, Select, Tooltip } from "@mantine/core";
import { GBoard } from "../../../board_core/board";
import { Scene } from "../../../board_core/scene";
import { IconSettings } from "@tabler/icons-react";
import {
    windowAtoms,
    WindowEntry,
} from "@/board_react_wrapper/stores/window_store";
import { SceneSettings } from "./SceneSettings";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";

const openSceneSettings = (): WindowEntry => {
    return {
        title: "Scene Settings",
        content: <SceneSettings />,
        name: "scene-settings",
    };
};

export const SceneSelection = () => {
    const scenes = useAtomValue(sceneAtoms.getScenes);
    const changeScene = useSetAtom(sceneAtoms.changeScene);
    const currentScene = useAtomValue(sceneAtoms.getCurrentScene);

    const openWindow = useSetAtom(windowAtoms.openWindow);

    const sceneData = (): ComboboxData => {
        return scenes.map((scene) => {
            return {
                value: scene.getUId(),
                label: scene.name,
            };
        });
    };

    return (
        <Flex
            direction="row"
            gap="xs"
            align="center"
            style={{
                pointerEvents: "all",
            }}
        >
            <Select
                searchable
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
            <Tooltip label="Scene settings">
                <ActionIcon
                    onClick={() => {
                        openWindow(openSceneSettings());
                    }}
                >
                    <IconSettings />
                </ActionIcon>
            </Tooltip>
        </Flex>
    );
};
