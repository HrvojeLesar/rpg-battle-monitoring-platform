import { Application, ApplicationOptions } from "pixi.js";
import { RefObject, useEffect, useRef } from "react";
import { type PixiApplicationProps } from "../types/pixi_application_props";
import { destroy } from "../board_core/board";
import { useAtomValue } from "jotai";
import { gameStore } from "../board_react_wrapper/stores/game_store";
import { Flex } from "@mantine/core";
import classes from "../css/board.module.css";
import { Hud } from "../board_react_wrapper/components/interface/Hud";
import { WindowOverlay } from "@/board_react_wrapper/components/floating_windows/Window";

declare global {
    var __PIXI_APP__: Application;
}

function defaultOptions(
    overrides: Partial<ApplicationOptions>,
): Partial<ApplicationOptions> {
    return {
        autoDensity: true,
        antialias: true,
        roundPixels: true,
        ...overrides,
    };
}

export const PixiApplication = (props: PixiApplicationProps) => {
    const { canvas, resizeTo, applicationOptions, applicationInitCallback } =
        props;

    console.log("pixi app rendered");

    const applicationRef = useRef<Application | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(canvas ?? null);
    const initPromiseRef = useRef<Promise<Application | null> | null>(null);
    const canvasRemoved = useRef(false);

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
            canvas.classList.add(classes.canvas);
            document.body.appendChild(canvas);
        }

        if (canvasRemoved.current && canvas) {
            const newCanvas = document.createElement("canvas");
            newCanvas.classList.add(...canvas.classList.values());
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

            document.getElementsByTagName("html")[0].style.overflow = "hidden";

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
                document.getElementsByTagName("html")[0].style.overflow = "";
                destroy();
            });
        };
    }, [applicationInitCallback, applicationOptions, resizeTo, gameId]);

    return (
        <Flex>
            <WindowOverlay />
            <Hud />
            <canvas
                id={classes.game}
                ref={canvasRef}
                className={classes.game}
            />
        </Flex>
    );
};
