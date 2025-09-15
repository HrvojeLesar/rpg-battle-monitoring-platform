import { CSS } from "@dnd-kit/utilities";
import {
    DndContext,
    DragEndEvent,
    DraggableAttributes,
    MouseSensor,
    TouchSensor,
    UniqueIdentifier,
    useDraggable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { ReactNode, useEffect } from "react";
import { Resizable } from "re-resizable";
import { Flex, Paper } from "@mantine/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { IconWindowMinimize } from "@tabler/icons-react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useAtomValue, useSetAtom } from "jotai";
import { windowAtoms } from "@/board_react_wrapper/stores/window_store";

export type WindowProps = {
    id: UniqueIdentifier;
    children?: ReactNode;
    styles?: React.CSSProperties;
    left: number;
    top: number;
    zIndex: number;
};

export type WindowHeaderProps = {
    styles?: React.CSSProperties;
    isDragging?: boolean;
    listeners?: SyntheticListenerMap;
    attributes?: DraggableAttributes;
};

const WindowHeader = (props: WindowHeaderProps) => {
    const { styles, isDragging, listeners, attributes } = props;
    return (
        <Flex
            style={{
                cursor: isDragging ? "grabbing" : "grab",
                ...styles,
            }}
            {...listeners}
            {...attributes}
        ></Flex>
    );
};

export function Window(props: WindowProps) {
    const { id, children, styles, left, top, zIndex } = props;
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id,
        });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const updateWindowZIndex = useSetAtom(windowAtoms.updateWindowZIndex);

    useEffect(() => {
        updateWindowZIndex(id);
    }, [isDragging, id, updateWindowZIndex]);

    return (
        <Paper
            withBorder
            shadow="xs"
            style={{
                ...style,
                left,
                top,
                position: "absolute",
                overflow: "hidden",
                zIndex,
            }}
            ref={setNodeRef}
            onClick={() => {
                updateWindowZIndex(id);
            }}
        >
            <Resizable
                onResizeStart={() => {
                    updateWindowZIndex(id);
                }}
                handleStyles={{
                    bottomRight: {
                        width: 12,
                        height: 12,
                        right: 12,
                        bottom: 12,
                    },
                }}
                handleComponent={{
                    bottomRight: (
                        <IconWindowMinimize transform="scale (-1, 1)" />
                    ),
                }}
                bounds="window"
                enable={{
                    top: false,
                    right: false,
                    bottom: false,
                    left: false,
                    topRight: false,
                    bottomRight: true,
                    bottomLeft: false,
                    topLeft: false,
                }}
            >
                <Flex direction="column">
                    <WindowHeader styles={styles} isDragging={isDragging} />
                    <Flex
                        style={{
                            ...styles,
                            cursor: isDragging ? "grabbing" : "grab",
                        }}
                        {...listeners}
                        {...attributes}
                    >
                        Header
                    </Flex>
                    <div>{children}</div>
                </Flex>
            </Resizable>
        </Paper>
    );
}

export const WindowOverlay = () => {
    const windows = useAtomValue(windowAtoms.windows);
    const updateWindowPosition = useSetAtom(windowAtoms.updateWindowPosition);

    const mouseSensor = useSensor(MouseSensor);
    const touchSensor = useSensor(TouchSensor);

    const sensors = useSensors(mouseSensor, touchSensor);

    const dragEnd = (e: DragEndEvent) => {
        const id = e.active.id;
        updateWindowPosition(id, e.delta);
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                width: "100dvw",
                height: "100dvh",
            }}
        >
            <DndContext
                sensors={sensors}
                onDragEnd={dragEnd}
                modifiers={[restrictToWindowEdges]}
            >
                {windows.map((w) => {
                    return (
                        <Window
                            key={w.id}
                            id={w.id}
                            left={w.position.x}
                            top={w.position.y}
                            zIndex={w.zIndex}
                        >
                            {w.window}
                        </Window>
                    );
                })}
            </DndContext>
        </div>
    );
};
