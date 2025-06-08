import { useEffect, useState } from "react";
import { Point } from "pixi.js";
import { Slider } from "./Inputs/Slider";
import { useEventEmitter } from "../hooks/bridge_context_hooks";

export const CanvasGui = () => {
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
            <Slider />
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
