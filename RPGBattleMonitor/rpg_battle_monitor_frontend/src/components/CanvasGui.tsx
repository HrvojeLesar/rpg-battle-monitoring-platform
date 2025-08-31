import { useContext, useEffect, useState } from "react";
import { Point } from "pixi.js";
import { useEventEmitter } from "../hooks/bridge_context_hooks";
import { ReactPixiJsBridgeEventEmitter } from "../types/event_emitter";
import {
    ReactPixiJsBridgeContext,
    ReactPixiJsBridgeContextProvider,
} from "../context/ReactPixiJsBridgeContext";
import { GridSlider } from "./Inputs/GridSlider";

export const CanvasGui = ({
    eventEmitter,
}: {
    eventEmitter: ReactPixiJsBridgeEventEmitter;
}) => {
    return (
        <ReactPixiJsBridgeContextProvider eventEmitter={eventEmitter}>
            <CanvasGuiInit />
        </ReactPixiJsBridgeContextProvider>
    );
};

const CanvasGuiInit = () => {
    const context = useContext(ReactPixiJsBridgeContext);

    const isReady = () => {
        if (context === undefined) {
            return false;
        }

        return context.isReady;
    };

    if (!isReady()) {
        return <>Context not initialized</>;
    }

    return <CanvasGuiInner />;
};

const CanvasGuiInner = () => {
    const eventEmitter = useEventEmitter();

    const [position, setPosition] = useState({
        position: new Point(64, 64),
        recordedPoint: new Point(64, 64),
    });

    useEffect(() => {
        eventEmitter.on("viewportMoved", ({ viewport, type }) => {
            if (type === "move") {
                setPosition((old) => {
                    const screenCoords = viewport.toScreen(old.recordedPoint);

                    return {
                        position: screenCoords,
                        recordedPoint: old.recordedPoint,
                    };
                });
            } else if (type === "zoom") {
                setPosition((old) => {
                    old.position.x *= viewport.scale.x;
                    old.position.y *= viewport.scale.y;

                    return {
                        ...old,
                    };
                });
            }
        });

        return () => {
            eventEmitter.off("viewportMoved");
        };
    }, [eventEmitter]);

    return (
        <>
            <GridSlider />
            <div
                style={{
                    transform: `translate(${position.position.x}px, ${position.position.y}px)`,
                    position: "absolute",
                }}
            >
                Hello
            </div>
        </>
    );
};
