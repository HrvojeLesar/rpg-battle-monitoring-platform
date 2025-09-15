import { Scene } from "@/board_core/scene";
import { sceneAtoms } from "@/board_react_wrapper/stores/board_store";
import { Box, Button, Divider, Flex, Title } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { GridSettings } from "../GridSettings";

export const SceneSettings = () => {
    const scenes = useAtomValue(sceneAtoms.getScenes);
    const changeScene = useSetAtom(sceneAtoms.changeScene);

    const [selectedScene, setSelectedScene] = useState<Scene>();

    useEffect(() => {
        if (!selectedScene) return;
        if (scenes.includes(selectedScene)) return;

        setSelectedScene(undefined);
    }, [selectedScene, scenes]);

    return (
        <Box>
            <Flex direction="row" gap="xs">
                <Flex direction="column" gap="xs">
                    <Title order={4}>Scenes</Title>
                    <Divider />
                    {scenes.map((scene) => {
                        return (
                            <Button
                                key={scene.getUId()}
                                onClick={() => {
                                    changeScene(scene);
                                    setSelectedScene(scene);
                                }}
                                variant={
                                    selectedScene?.getUId() === scene.getUId()
                                        ? "filled"
                                        : "outline"
                                }
                            >
                                {scene.name}
                            </Button>
                        );
                    })}
                </Flex>
                <Divider orientation="vertical" />
                {selectedScene?.name && (
                    <GridSettings grid={selectedScene?.grid} />
                )}
            </Flex>
        </Box>
    );
};
