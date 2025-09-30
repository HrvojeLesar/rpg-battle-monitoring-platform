import { GBoard } from "@/board_core/board";
import { ContainerExtension } from "@/board_core/extensions/container_extension";
import { selectAtoms } from "@/board_react_wrapper/stores/select_store";
import { queueEntityUpdate } from "@/websocket/websocket";
import { Button, Flex } from "@mantine/core";
import { useAtomValue } from "jotai";
import { ReactNode, useState } from "react";

export type SelectionControlsProps = {
    children?: ReactNode;
};

export const SelectionControls = (props: SelectionControlsProps) => {
    const { children } = props;

    return <>{children}</>;
};

const DeleteSelection = () => {
    const selections = useAtomValue(selectAtoms.selections);

    if (selections.length === 0) {
        return <></>;
    }

    return (
        <Button
            // TODO: Add style props
            style={{
                pointerEvents: "all",
            }}
            onClick={() => {
                GBoard.scene?.selectHandler.deleteSelected();
            }}
        >
            Delete Selection
        </Button>
    );
};

const ChangeContainerProperties = () => {
    const selections = useAtomValue(selectAtoms.selections);

    if (selections.length === 0) {
        return <></>;
    }

    const updateContainer = (container: ContainerExtension) => {
        queueEntityUpdate(() => {
            return container;
        });
    };

    return selections.map((selection, idx) => {
        return (
            <ContainerProperty
                key={idx}
                container={selection}
                updateFn={updateContainer}
            />
        );
    });
};

type ContainerPropertyProps = {
    container: ContainerExtension;
    updateFn: (container: ContainerExtension) => void;
};

const ContainerProperty = (props: ContainerPropertyProps) => {
    const { container, updateFn } = props;

    const [snapping, setSnapping] = useState(container.isSnapping);
    const [draggable, setDraggable] = useState(container.isDraggable);
    const [selectable, setSelectable] = useState(container.isSelectable);
    const [resizable, setResizable] = useState(container.isResizable);

    return (
        <Flex
            style={{
                pointerEvents: "all",
            }}
            gap="xs"
        >
            <Button
                onClick={() => {
                    container.isSnapping = !container.isSnapping;
                    setSnapping(container.isSnapping);
                    updateFn(container);
                }}
            >
                {snapping ? "Snapping" : "Not snapping"}
            </Button>
            <Button
                onClick={() => {
                    container.isDraggable = !container.isDraggable;
                    setDraggable(container.isDraggable);
                    updateFn(container);
                }}
            >
                {draggable ? "Draggable" : "Not draggable"}
            </Button>
            <Button
                onClick={() => {
                    container.isSelectable = !container.isSelectable;
                    setSelectable(container.isSelectable);
                    updateFn(container);
                }}
            >
                {selectable ? "Selectable" : "Not selectable"}
            </Button>
            <Button
                onClick={() => {
                    container.isResizable = !container.isResizable;
                    setResizable(container.isResizable);
                    updateFn(container);
                }}
            >
                {resizable ? "Resizable" : "Not resizable"}
            </Button>
        </Flex>
    );
};

SelectionControls.DeleteSelection = DeleteSelection;
SelectionControls.ContainerProperties = ChangeContainerProperties;
