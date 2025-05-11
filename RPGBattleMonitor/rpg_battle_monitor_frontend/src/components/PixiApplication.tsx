import { Application, ApplicationOptions } from "pixi.js";
import { useCallback, useContext, useEffect, useRef } from "react";
import { PixiApplicationProps } from "../types/pixi_application_props";
import {
    ReactPixiJsBridgeContext,
    ReactPixiJsBridgeContextProvider,
} from "../context/ReactPixiJsBridgeContext";
import { CanvasGui } from "./CanvasGui";

declare global {
    var __PIXI_APP__: Application;
}

function defaultOptions(): Partial<ApplicationOptions> {
    return {
        resolution: window.devicePixelRatio,
        autoDensity: true,
        antialias: true,
        roundPixels: true,
    };
}

export const PixiApplication = (props: PixiApplicationProps) => {
    return (
        <ReactPixiJsBridgeContextProvider>
            <PixiApplicationInner {...props} />
        </ReactPixiJsBridgeContextProvider>
    );
};

const PixiApplicationInner = (props: PixiApplicationProps) => {
    const {
        canvas,
        resizeTo,
        canvasClass,
        applicationOptions,
        applicationInitCallback,
    } = props;

    console.log("rerender pixi");

    const applicationRef = useRef<Application | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(canvas ?? null);
    const canvasRemoved = useRef(false);
    const eventEmitter = useContext(ReactPixiJsBridgeContext);

    useCallback(() => {
        const application = applicationRef.current;
        if (application === null) {
            return;
        }
        if (resizeTo === undefined) {
            // @ts-expect-error
            application.resizeTo = undefined;
            return;
        }

        if ("current" in resizeTo) {
            if (resizeTo.current instanceof HTMLElement) {
                application.resizeTo = resizeTo.current;
            }
        } else {
            application.resizeTo = resizeTo;
        }
    }, [resizeTo]);

    useEffect(() => {
        const application = new Application();

        let canvas = canvasRef.current;
        if (canvas === null) {
            console.error("CanvasRef not found. Adding canvas to document");
            canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
        }

        if (canvasRemoved.current && canvas) {
            const newCanvas = document.createElement("canvas");
            canvas.replaceWith(newCanvas);

            canvasRef.current = newCanvas;
            canvas = newCanvas;

            canvasRemoved.current = false;
        }

        async function initPixi() {
            const options = applicationOptions ?? defaultOptions();

            await application.init({
                ...options,
                canvas: canvas as HTMLCanvasElement,
            });

            if (applicationInitCallback !== undefined) {
                applicationInitCallback(application, eventEmitter);
            }

            globalThis.__PIXI_APP__ = application;

            canvas?.addEventListener("wheel", (event) => {
                event.preventDefault();
            });

            return application;
        }

        const initPromise = initPixi();

        return () => {
            canvasRemoved.current = true;
            initPromise.then((application) => {
                application.destroy();
            });
        };
    }, []);

    return (
        <>
            <CanvasGui />
            <canvas ref={canvasRef} className={canvasClass} />
        </>
    );
};
