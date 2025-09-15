import { CSS } from "@dnd-kit/utilities";
import { Coordinates } from "@dnd-kit/utilities";
import {
    DndContext,
    DragEndEvent,
    MouseSensor,
    TouchSensor,
    UniqueIdentifier,
    useDraggable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { forwardRef, ReactNode, useState } from "react";
import { Resizable } from "re-resizable";
import { Box, Flex } from "@mantine/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useElementSize } from "@mantine/hooks";
import { IconWindowMinimize } from "@tabler/icons-react";

export type WindowProps = {
    id: UniqueIdentifier;
    children?: ReactNode;
    styles?: React.CSSProperties;
    left: number;
    top: number;
};

export const Draggable = forwardRef<HTMLDivElement, WindowProps>(
    function Draggable(props, ref) {
        const { id, children, styles, left, top } = props;
        const { attributes, listeners, setNodeRef, transform, isDragging } =
            useDraggable({
                id,
            });

        const style = {
            // Outputs `translate3d(x, y, 0)`
            transform: CSS.Translate.toString(transform),
        };

        return (
            <Box
                style={{
                    ...style,
                    position: "absolute",
                    left,
                    top,
                    border: "1px solid red",
                    overflow: "hidden",
                }}
                ref={(r) => {
                    switch (typeof ref) {
                        case "function":
                            ref(r);
                            break;
                        case "object":
                            if (ref !== null) {
                                ref.current = r;
                            }
                            break;
                    }

                    setNodeRef(r);
                }}
            >
                <Resizable
                    handleComponent={{
                        bottomRight: (
                            <IconWindowMinimize
                                size={16}
                                transform="scale (-1, 1)"
                            />
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
                        <div
                            style={{
                                ...styles,
                                cursor: isDragging ? "grabbing" : "grab",
                            }}
                            {...listeners}
                            {...attributes}
                        >
                            Header
                        </div>
                        <div>{children}</div>
                    </Flex>
                </Resizable>
            </Box>
        );
    },
);

export function DndList() {
    const [{ x, y }, setCoordinates] = useState<Coordinates>({ x: 0, y: 0 });

    const { ref, width, height } = useElementSize();

    console.log(width, height);

    const mouseSensor = useSensor(MouseSensor);
    const touchSensor = useSensor(TouchSensor);

    const sensors = useSensors(mouseSensor, touchSensor);

    const dragEnd = (e: DragEndEvent) => {
        setCoordinates(({ x, y }) => {
            return {
                x: x + e.delta.x,
                y: y + e.delta.y,
            };
        });
    };

    return (
        <WindowOverlay>
            <DndContext
                sensors={sensors}
                onDragEnd={dragEnd}
                modifiers={[restrictToWindowEdges]}
            >
                <Draggable id={1} left={x} top={y} ref={ref}>
                    <div>Hello world</div>
                </Draggable>
            </DndContext>
        </WindowOverlay>
    );
}

export type WindowOverlayProps = {
    children: ReactNode;
};

const WindowOverlay = ({ children }: WindowOverlayProps) => {
    return (
        <div style={{ position: "fixed", width: "100dvw", height: "100dvh" }}>
            {children}
        </div>
    );
};
