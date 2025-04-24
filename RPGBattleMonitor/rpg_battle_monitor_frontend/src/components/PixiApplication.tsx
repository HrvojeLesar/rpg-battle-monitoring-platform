import { Application, ApplicationOptions } from "pixi.js";
import { useCallback, useLayoutEffect, useRef } from "react";
import { PixiApplicationProps } from "../types/PixiApplicationProps";
import { app } from "@tauri-apps/api";

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
        applicationIdentifier,
        applicationInitCallback,
    } = props;

    const applicationRef = useRef<Application | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(canvas ?? null);

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

    useLayoutEffect(() => {
        const application = new Application();

        let canvas = canvasRef.current;
        if (canvas === null) {
            console.error("CanvasRef not found adding canvas to document");
            canvas = document.createElement("canvas");
            document.appendChild(canvas);
        }

        async function initPixi() {
            console.log("pixi.js initialized");
            const options = applicationOptions ?? defaultOptions();

            await application.init({
                ...options,
                canvas: canvas as HTMLCanvasElement,
            });

            if (applicationInitCallback !== undefined) {
                applicationInitCallback(application, applicationIdentifier);
            }
        }

        initPixi();

        return () => {
            console.log("Destroying instance of pixi.js application");
            applicationRef.current?.destroy();
        };
    }, []);

    return <canvas ref={canvasRef} className={canvasClass} />;
};
