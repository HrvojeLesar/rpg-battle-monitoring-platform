import { Scene } from "@/board_core/scene";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { Button, Divider, Flex, Fieldset, TextInput } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { GridSettings } from "../GridSettings";
import { sceneAtomsUtils } from "@/board_react_wrapper/stores/utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { queueEntityUpdate } from "@/websocket/websocket";
import { DeleteConfirmation } from "../utils/DeleteConfirmation";
import { sceneAtomsExt } from "@/rpg_impl/stores/scene_store_ext";

const SCENE_NAME = "Scene name";

export type SceneOptionsProps = {
    scene: Scene;
};

export const SceneOptions = (props: SceneOptionsProps) => {
    const { scene } = props;
    const [name, setName] = useState(scene?.name);
    const refreshScenes = useSetAtom(sceneAtoms.refreshScenes);

    useEffect(() => {
        setName(scene.name);
    }, [scene.name]);

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
        <Fieldset legend="Scene options" style={{ overflow: "auto" }}>
            <TextInput
                label={SCENE_NAME}
                title={SCENE_NAME}
                placeholder="Input scene name..."
                value={name}
                onChange={(e) => {
                    const name = e.currentTarget.value;
                    setNameHandler(name);
                    queueSceneUpdate(scene, name);
                }}
            />
        </Fieldset>
    );
};

export const SceneSettings = () => {
    const scenes = useAtomValue(sceneAtoms.getScenes);
    const changeScene = useSetAtom(sceneAtoms.changeScene);
    const removeScene = useSetAtom(sceneAtoms.removeScene);
    const createScene = useSetAtom(sceneAtomsExt.createScene);

    const [selectedScene, setSelectedScene] = useState<Scene>();

    useEffect(() => {
        if (!selectedScene) return;
        if (scenes.includes(selectedScene)) return;

        setSelectedScene(undefined);
    }, [selectedScene, scenes]);

    return (
        <Flex direction="row" gap="xs" wrap="wrap">
            <Fieldset legend="Scene">
                <Flex direction="column" gap="xs">
                    <Button
                        onClick={() => {
                            createScene({
                                name: `scene-${scenes.length + 1}`,
                                sortPositionFunc:
                                    sceneAtomsUtils.getNextSortPosition,
                            });
                        }}
                    >
                        New scene
                    </Button>
                    {scenes.map((scene) => {
                        return (
                            <Flex
                                key={scene.getUId()}
                                gap="xs"
                                align="center"
                                justify="space-between"
                            >
                                <Button
                                    flex="2"
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
                                <DeleteConfirmation
                                    title="Delete scene"
                                    onDelete={() => {
                                        removeScene(scene);
                                    }}
                                />
                            </Flex>
                        );
                    })}
                </Flex>
            </Fieldset>
            <Divider orientation="vertical" />
            {selectedScene && <SceneOptions scene={selectedScene} />}
            {selectedScene && <GridSettings grid={selectedScene?.grid} />}
        </Flex>
    );
};
