import { Application, ApplicationOptions } from "pixi.js";
import { RefObject, useEffect, useRef } from "react";
import { type PixiApplicationProps } from "../types/pixi_application_props";
import { destroy } from "../board_core/board";
import { useAtomValue, useSetAtom } from "jotai";
import { sceneAtoms } from "../board_react_wrapper/stores/board_store";
import { gameStore } from "../board_react_wrapper/stores/game_store";
import { GridSettings } from "../board_react_wrapper/components/GridSettings";
import { TokenFactory } from "../board_core/factories/token_factory";
import { Scene } from "../board_core/scene";
import { Resizable } from "re-resizable";
import { Button } from "@mantine/core";

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

    console.log("pixi app rendered");

    const applicationRef = useRef<Application | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(canvas ?? null);
    const initPromiseRef = useRef<Promise<Application | null> | null>(null);
    const canvasRemoved = useRef(false);

    const scenes = useAtomValue(sceneAtoms.getScenes);
    const changeScene = useSetAtom(sceneAtoms.changeScene);
    const currentScene = useAtomValue(sceneAtoms.getCurrentScene);
    const createScene = useSetAtom(sceneAtoms.createScene);
    const removeScene = useSetAtom(sceneAtoms.removeScene);

    const gameId = useAtomValue(gameStore.getGameId);

    useEffect(() => {
        const application = applicationRef.current;
        if (application === null) {
            return;
        }
        if (resizeTo === undefined) {
            // @ts-expect-error resetting resizeto back to an empty value
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
                application = await applicationInitCallback(
                    {
                        gameId: gameId ?? 0,
                    },
                    {
                        ...options,
                        canvas: canvas as HTMLCanvasElement,
                    },
                );
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
    }, [applicationInitCallback, applicationOptions, resizeTo, gameId]);

    const gridSettings = () => {
        if (!currentScene) {
            return <></>;
        }

        return (
            <>
                <GridSettings grid={currentScene.grid} />
            </>
        );
    };

    const addTokenButton = () => {
        if (!currentScene) {
            return <></>;
        }

        return (
            <Button
                onClick={() => {
                    TokenFactory.createToken(currentScene);
                }}
            >
                Add token to scene
            </Button>
        );
    };

    return (
        <>
            <Resizable>
                <Button>Abc</Button>
                <Button>Abc</Button>
                <Button>Abc</Button>
                <Button>Abc</Button>
            </Resizable>
            <div style={{ overflow: "hidden", position: "relative" }}>
                <canvas ref={canvasRef} className={canvasClass} />
                <Button
                    onClick={() => {
                        createScene({
                            name: `test-scene${scenes.length + 1}`,
                        });
                    }}
                >
                    Add scene
                </Button>
                {addTokenButton()}
                {scenes.map((scene, idx) => {
                    return (
                        <Button
                            key={idx}
                            onClick={() => {
                                changeScene(scene);
                            }}
                        >
                            {scene.name}
                        </Button>
                    );
                })}
                {gridSettings()}
                <Button
                    onClick={() => {
                        if (currentScene) {
                            removeScene(currentScene);
                        }
                    }}
                >
                    Remove current scene
                </Button>
            </div>
        </>
    );
};
