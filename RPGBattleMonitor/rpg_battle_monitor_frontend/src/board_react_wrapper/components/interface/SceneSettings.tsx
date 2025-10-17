import { Scene } from "@/board_core/scene";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import {
    Button,
    Divider,
    Flex,
    Fieldset,
    TextInput,
    ActionIcon,
} from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { GridSettings } from "../GridSettings";
import { sceneAtomsUtils } from "@/board_react_wrapper/stores/utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { queueEntityUpdate } from "@/websocket/websocket";
import { DeleteConfirmation } from "../utils/DeleteConfirmation";
import { sceneAtomsExt } from "@/rpg_impl/stores/scene_store_ext";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconEye, IconEyeOff, IconGripVertical } from "@tabler/icons-react";
import { restrictToParentElement } from "@dnd-kit/modifiers";

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
    const createScene = useSetAtom(sceneAtomsExt.createScene);
    const refreshScenes = useSetAtom(sceneAtoms.refreshScenes);

    const [selectedScene, setSelectedScene] = useState<Scene>();

    useEffect(() => {
        if (!selectedScene) return;
        if (scenes.includes(selectedScene)) return;

        setSelectedScene(undefined);
    }, [selectedScene, scenes]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    );

    const handleDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;

        const draggedSceneIndex = scenes.findIndex(
            (s) => s.getUId() === active.id,
        );
        const otherSceneIndex = scenes.findIndex(
            (s) => s.getUId() === over?.id,
        );

        if (draggedSceneIndex === otherSceneIndex) {
            return;
        }

        const draggedScene = scenes[draggedSceneIndex];

        let directionDown = true;
        if (draggedSceneIndex > otherSceneIndex) {
            directionDown = false;
        }

        const idx = Math.min(draggedSceneIndex, otherSceneIndex);
        const iterateTo = Math.max(draggedSceneIndex, otherSceneIndex);
        const iterableScenes = scenes.slice(idx, iterateTo + 1);

        const updatedScenes: Scene[] = [];

        if (directionDown === false) {
            iterableScenes.reverse();
        }

        for (const otherScene of iterableScenes) {
            if (otherScene === draggedScene) {
                continue;
            }

            const otherSortPosition = otherScene.sortPosition;
            otherScene.sortPosition = draggedScene.sortPosition;
            draggedScene.sortPosition = otherSortPosition;

            updatedScenes.push(otherScene);
        }

        if (updatedScenes.length > 0) {
            updatedScenes.push(draggedScene);

            queueEntityUpdate(() => {
                return updatedScenes;
            });
        }

        refreshScenes();
    };

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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToParentElement]}
                    >
                        <SortableContext
                            items={scenes.map((s) => s.getUId())}
                            strategy={verticalListSortingStrategy}
                        >
                            {scenes.map((scene) => {
                                return (
                                    <SceneItem
                                        key={scene.getUId()}
                                        scene={scene}
                                        selectedScene={selectedScene}
                                        setSelectedScene={setSelectedScene}
                                    />
                                );
                            })}
                        </SortableContext>
                    </DndContext>
                </Flex>
            </Fieldset>
            <Divider orientation="vertical" />
            {selectedScene && <SceneOptions scene={selectedScene} />}
            {selectedScene && <GridSettings grid={selectedScene?.grid} />}
        </Flex>
    );
};

export type SceneItemProps = {
    selectedScene?: Scene;
    setSelectedScene: (scene: Scene) => void;
    scene: Scene;
};

export const SceneItem = (props: SceneItemProps) => {
    const { setSelectedScene, scene, selectedScene } = props;
    const changeScene = useSetAtom(sceneAtoms.changeScene);
    const removeScene = useSetAtom(sceneAtoms.removeScene);

    const [hidden, setHidden] = useState(scene.hidden);

    useEffect(() => {
        setHidden(scene.hidden);
    }, [scene.hidden]);

    const toggleHiddenHandler = () => {
        const hidden = !scene.hidden;
        setHidden(hidden);
        scene.hidden = hidden;

        queueEntityUpdate(() => {
            return scene;
        });
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: scene.getUId(),
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Flex
            key={scene.getUId()}
            gap="xs"
            align="center"
            justify="space-between"
            style={{
                boxShadow: isDragging ? "var(--mantine-shadow-sm)" : undefined,
                ...style,
            }}
            ref={setNodeRef}
            {...attributes}
        >
            <IconGripVertical size={18} stroke={1.5} {...listeners} />
            <Button
                title={scene.name}
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
            <ActionIcon
                onClick={() => {
                    toggleHiddenHandler();
                }}
                variant="outline"
                title={hidden ? "Show scene" : "Hide scene"}
            >
                {hidden ? <IconEyeOff /> : <IconEye />}
            </ActionIcon>
            <DeleteConfirmation
                title="Delete scene"
                onDelete={() => {
                    removeScene(scene);
                }}
            />
        </Flex>
    );
};
