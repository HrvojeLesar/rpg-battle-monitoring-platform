import { Viewport } from "pixi-viewport";
import { Application, Sprite, Texture } from "pixi.js";
import { CanvasContextType } from "./context/CanvasContext";

export const createCanvasAppAndViewport = async (): Promise<CanvasContextType> => {
    const app = new Application();
    await app.init();

    document.body.appendChild(app.canvas);
    const viewport = new Viewport({
        events: app.renderer.events,
    });

    // add the viewport to the stage
    app.stage.addChild(viewport);

    // activate plugins
    viewport.drag().pinch().wheel().decelerate();

    // add a red box
    const sprite = viewport.addChild(new Sprite(Texture.WHITE));
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = 100;
    sprite.position.set(100, 100);

    return { app, viewport };
};
