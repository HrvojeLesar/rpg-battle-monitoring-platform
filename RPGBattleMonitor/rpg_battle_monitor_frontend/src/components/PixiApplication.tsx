import { Application, ApplicationOptions, EventEmitter } from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { PixiApplicationProps } from "../types/pixi_application_props";

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
    const {
        canvas,
        resizeTo,
        canvasClass,
        applicationOptions,
        applicationInitCallback,
    } = props;

    const applicationRef = useRef<Application | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(canvas ?? null);
    const canvasRemoved = useRef(false);
    // TODO: This will most likely be changed into a context, so any child elements will have access to event emitter
    const eventEmitter = useRef(new EventEmitter());

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
                applicationInitCallback(application, eventEmitter.current);
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

    return <canvas ref={canvasRef} className={canvasClass} />;
};
