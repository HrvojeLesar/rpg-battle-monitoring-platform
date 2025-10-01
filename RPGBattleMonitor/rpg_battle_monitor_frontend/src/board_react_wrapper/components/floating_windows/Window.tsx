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
import {
    CloseButton,
    Divider,
    Flex,
    Paper,
    ScrollArea,
    Title,
} from "@mantine/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { IconArrowsDiagonal } from "@tabler/icons-react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useAtomValue, useSetAtom } from "jotai";
import { windowAtoms } from "@/board_react_wrapper/stores/window_store";

export type WindowProps = {
    id: UniqueIdentifier;
    children?: ReactNode;
    styles?: React.CSSProperties;
    title?: string;
    left: number;
    top: number;
    zIndex: number;
    resizable?: boolean;
};

export type WindowHeaderProps = {
    styles?: React.CSSProperties;
    isDragging?: boolean;
    listeners?: SyntheticListenerMap;
    attributes?: DraggableAttributes;
    title?: string;
    onClose?: () => void;
};

export const WINDOW_MIN_HEIGHT = 120;
export const WINDOW_MIN_WIDTH = 120;

const WindowHeader = (props: WindowHeaderProps) => {
    const { styles, isDragging, listeners, attributes, title, onClose } = props;
    return (
        <Flex
            style={{
                cursor: isDragging ? "grabbing" : "grab",
                ...styles,
            }}
            {...listeners}
            {...attributes}
            gap="xs"
            align="center"
            justify="space-between"
        >
            <Title order={4}>{title}</Title>
            <CloseButton onClick={onClose} />
        </Flex>
    );
};

export function Window(props: WindowProps) {
    const { id, children, styles, left, top, zIndex, title } = props;
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id,
        });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const updateWindowZIndex = useSetAtom(windowAtoms.updateWindowZIndex);
    const removeWindow = useSetAtom(windowAtoms.removeWindow);

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
                        <IconArrowsDiagonal transform="scale (-1, 1)" />
                    ),
                }}
                minHeight={WINDOW_MIN_HEIGHT}
                minWidth={WINDOW_MIN_WIDTH}
                maxHeight="calc(100vh - (var(--mantine-spacing-md) * 8))"
                maxWidth="calc(100vw - (var(--mantine-spacing-md) * 8))"
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
                <Flex direction="column" p="xs" gap="xs" maw="100%" mah="100%">
                    <WindowHeader
                        styles={styles}
                        isDragging={isDragging}
                        listeners={listeners}
                        attributes={attributes}
                        title={title}
                        onClose={() => {
                            removeWindow(id);
                        }}
                    />
                    <Divider />
                    <div
                        style={{
                            overflow: "auto",
                            maxHeight:
                                "calc(100vh - (var(--mantine-spacing-md) * 8))",
                            maxWidth:
                                "calc(100vw - (var(--mantine-spacing-md) * 8))",
                        }}
                    >
                        {children}
                    </div>
                </Flex>
            </Resizable>
        </Paper>
    );
}

export const WindowOverlay = () => {
    const windows = useAtomValue(windowAtoms.windows);
    const updateWindowPosition = useSetAtom(windowAtoms.updateWindowPosition);

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: { distance: 1 },
    });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: { distance: 1 },
    });

    const sensors = useSensors(mouseSensor, touchSensor);

    const dragEnd = (e: DragEndEvent) => {
        const id = e.active.id;
        updateWindowPosition(id, e.delta);
    };

    return (
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
                        title={w.title}
                        resizable={w.resizable}
                    >
                        {w.content}
                    </Window>
                );
            })}
        </DndContext>
    );
};
