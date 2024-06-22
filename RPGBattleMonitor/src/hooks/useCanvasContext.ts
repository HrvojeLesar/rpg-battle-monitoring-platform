import { useContext } from "react";
import { CanvasContext } from "../context/CanvasContext";
import { Application, Renderer } from "pixi.js";
import { Viewport } from "pixi-viewport";

export function useApp(): Application<Renderer> {
    const canvasContext = useContext(CanvasContext);
    if (canvasContext === null) {
        throw new Error(
            "CanvasContext not found. Wrap with <CanvasContextProvider>",
        );
    }

    return canvasContext.app;
}

export function useViewport(): Viewport {
    const canvasContext = useContext(CanvasContext);
    if (canvasContext === null) {
        throw new Error(
            "CanvasContext not found. Wrap with <CanvasContextProvider>",
        );
    }

    return canvasContext.viewport;
}
