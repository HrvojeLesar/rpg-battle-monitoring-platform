import { Viewport } from "pixi-viewport";
import { Application, Renderer } from "pixi.js";
import { ReactNode, createContext } from "react";

export type CanvasContextType = {
    app: Application<Renderer>;
    viewport: Viewport;
};

export const CanvasContext = createContext<CanvasContextType | null>(null);

export default function CanvasContextProvider({
    canvasContext,
    children,
}: {
    canvasContext: CanvasContextType;
    children?: ReactNode;
}) {
    return (
        <CanvasContext.Provider value={canvasContext}>
            {children}
        </CanvasContext.Provider>
    );
}
