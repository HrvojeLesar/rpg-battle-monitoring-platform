import { Application, ApplicationOptions } from "pixi.js";
import { RefObject, useEffect, useRef } from "react";
import { type PixiApplicationProps } from "../types/pixi_application_props";
import { destroy } from "../board_core/board";
import { Button } from "antd";
import {
    getScene,
    getScenes,
    sceneReducer,
    useStoreDispatch,
    useStoreSelector,
} from "../board_react_wrapper/board_store";
import { ButtonColorType } from "antd/es/button";

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
    const initPromiseRef = useRef<Promise<Application | null> | null>(null);
    const canvasRemoved = useRef(false);
    const scenes = useStoreSelector(getScenes);
    const currentScene = useStoreSelector(getScene);
    const dispatch = useStoreDispatch();

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
                dispatch(sceneReducer.actions.clearScenes());
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

        if (!initPromiseRef.current) {
            initPromiseRef.current = initPixi();
        } else {
            initPromiseRef.current.then(() => {
                initPromiseRef.current = initPixi();
            });
        }

        return () => {
            canvasRemoved.current = true;
            initPromiseRef.current?.then(() => {
                destroy();
            });
        };
    }, []);

    const buttonColour = (sceneName: string): Maybe<ButtonColorType> => {
        if (sceneName === currentScene) {
            return "primary";
        }

        return undefined;
    };

    return (
        <>
            <div style={{ overflow: "hidden", position: "relative" }}>
                <canvas ref={canvasRef} className={canvasClass} />
                <Button
                    onClick={() => {
                        dispatch(
                            sceneReducer.actions.addScene(
                                `test-scene${scenes.length + 1}`,
                            ),
                        );
                    }}
                >
                    Add scene
                </Button>
                {scenes.map((sceneName) => {
                    return (
                        <Button
                            key={sceneName}
                            color={buttonColour(sceneName)}
                            variant="solid"
                            onClick={() => {
                                console.log("change scene to", sceneName);
                                dispatch(
                                    sceneReducer.actions.changeScene(sceneName),
                                );
                            }}
                        >
                            {sceneName}
                        </Button>
                    );
                })}
            </div>
        </>
    );
};
