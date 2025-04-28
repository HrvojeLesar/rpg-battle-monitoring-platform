import { createContext } from "react";
import { CanvasContext } from "../types/canvas_context";

export const Context = createContext<CanvasContext>({} as CanvasContext);

export const CanvasContextProvider = Context.Provider;
export const CanvasContextConsumer = Context.Consumer;
