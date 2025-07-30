import { Application, ApplicationOptions, EventEmitter } from "pixi.js";
import { RefObject, useEffect, useRef } from "react";
import { type PixiApplicationProps } from "../types/pixi_application_props";
import { ReactPixiJsBridgeEventEmitter } from "../types/event_emitter";
import { destroy, GBoard, GEventEmitter } from "../board_core/board";
import { Button } from "antd";

declare global {
    var __PIXI_APP__: Application;
}

function defaultOptions(
    overrides: Partial<ApplicationOptions>,
): Partial<ApplicationOptions> {
    return {
        resolution: window.devicePixelRatio,
        autoDensity: true,
        antialias: true,
        roundPixels: true,
        ...overrides,
    };
}

export let GPixiInstanceNumber = 0;

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

    useEffect(() => {
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
            let application: Option<Application> = null;
            let resize: HTMLElement | Window | undefined;
            if (resizeTo !== undefined && Object.hasOwn(resizeTo, "current")) {
                resize =
                    (resizeTo as RefObject<HTMLElement | undefined>).current ??
                    undefined;
            } else {
                resize = resizeTo as HTMLElement | Window | undefined;
            }
            const options =
                applicationOptions ?? defaultOptions({ resizeTo: resize });

            if (applicationInitCallback !== undefined) {
                application = await applicationInitCallback({
                    ...options,
                    canvas: canvas as HTMLCanvasElement,
                });
            }

            canvas?.addEventListener("wheel", (event) => {
                event.preventDefault();
            });

            applicationRef.current = application;

            return application;
        }

        const initPromise = initPixi();

        return () => {
            canvasRemoved.current = true;
            initPromise.then(() => {
                destroy();
            });
        };
    }, []);

    return (
        <>
            <div style={{ overflow: "hidden", position: "relative" }}>
                <canvas ref={canvasRef} className={canvasClass} />
            </div>
        </>
    );
};
