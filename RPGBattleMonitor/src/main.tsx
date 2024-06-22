import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CanvasContextProvider from "./context/CanvasContext";
import { createCanvasAppAndViewport } from "./initUtil";

const canvasContext = await createCanvasAppAndViewport();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <CanvasContextProvider canvasContext={canvasContext}>
            <App />
        </CanvasContextProvider>
    </React.StrictMode>,
);
