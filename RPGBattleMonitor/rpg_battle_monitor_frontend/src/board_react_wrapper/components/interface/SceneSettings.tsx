import { Scene } from "@/board_core/scene";
import { sceneAtoms } from "@/board_react_wrapper/stores/board_store";
import {
    ActionIcon,
    Button,
    Container,
    Divider,
    Flex,
    Popover,
    Title,
    Text,
    Input,
} from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { GridSettings } from "../GridSettings";
import { IconTrash } from "@tabler/icons-react";
import { sceneAtomsUtils } from "@/board_react_wrapper/stores/utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { queueEntityUpdate } from "@/websocket/websocket";

const SCENE_NAME = "Scene name";

export type SceneOptionsProps = {
    scene: Scene;
};

export const SceneOptions = (props: SceneOptionsProps) => {
    const { scene } = props;
    const [name, setName] = useState(scene?.name);
    const refreshScenes = useSetAtom(sceneAtoms.refreshScenes);

    const queueSceneUpdate = useDebouncedCallback(
        (scene: Scene, name: string) => {
            if (name.trim().length === 0) return;

            scene.name = name;
            queueEntityUpdate(() => {
                return scene;
            });

            refreshScenes();
        },
        200,
    );

    const setNameHandler = (name: string) => {
        setName(name);
    };

    return (
        <Input.Wrapper label={SCENE_NAME} title={SCENE_NAME}>
            <Input
                placeholder={name}
                value={name}
                onChange={(e) => {
                    const name = e.currentTarget.value;
                    setNameHandler(name);
                    queueSceneUpdate(scene, name);
                }}
            ></Input>
        </Input.Wrapper>
    );
};

export const SceneSettings = () => {
    const scenes = useAtomValue(sceneAtoms.getScenes);
    const changeScene = useSetAtom(sceneAtoms.changeScene);
    const removeScene = useSetAtom(sceneAtoms.removeScene);
    const createScene = useSetAtom(sceneAtoms.createScene);

    const [selectedScene, setSelectedScene] = useState<Scene>();

    useEffect(() => {
        if (!selectedScene) return;
        if (scenes.includes(selectedScene)) return;

        setSelectedScene(undefined);
    }, [selectedScene, scenes]);

    return (
        <Container my="xs">
            <Flex direction="row" gap="xs" wrap="wrap">
                <Flex direction="column" gap="xs">
                    <Title order={4}>Scenes</Title>
                    <Divider />
                    <Button
                        onClick={() => {
                            createScene({
                                name: `test-scene${scenes.length + 1}`,
                                sortPositionFunc:
                                    sceneAtomsUtils.getNextSortPosition,
                            });
                        }}
                    >
                        New scene
                    </Button>
                    {scenes.map((scene) => {
                        return (
                            <Flex key={scene.getUId()} gap="xs" align="center">
                                <Button
                                    title={scene.name}
                                    onClick={() => {
                                        changeScene(scene);
                                        setSelectedScene(scene);
                                    }}
                                    variant={
                                        selectedScene?.getUId() ===
                                        scene.getUId()
                                            ? "filled"
                                            : "outline"
                                    }
                                >
                                    {scene.name}
                                </Button>
                                <Popover withArrow shadow="xs">
                                    <Popover.Target>
                                        <ActionIcon
                                            variant="outline"
                                            color="red"
                                            title="Delete scene"
                                        >
                                            <IconTrash />
                                        </ActionIcon>
                                    </Popover.Target>
                                    <Popover.Dropdown>
                                        <Flex gap="xs" align="center">
                                            <Text c="red">Are you sure?</Text>
                                            <Button
                                                size="xs"
                                                color="red"
                                                onClick={() => {
                                                    removeScene(scene);
                                                }}
                                            >
                                                Yes
                                            </Button>
                                        </Flex>
                                    </Popover.Dropdown>
                                </Popover>
                            </Flex>
                        );
                    })}
                </Flex>
                <Divider orientation="vertical" />
                {selectedScene && <SceneOptions scene={selectedScene} />}
                {selectedScene && <GridSettings grid={selectedScene?.grid} />}
            </Flex>
        </Container>
    );
};
