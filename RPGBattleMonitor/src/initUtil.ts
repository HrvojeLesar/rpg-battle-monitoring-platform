import { Viewport } from "pixi-viewport";
import {
    Application,
    FederatedPointerEvent,
    Point,
    Sprite,
    Texture,
} from "pixi.js";
import { CanvasContextType } from "./context/CanvasContext";

export async function createCanvasAppAndViewport(): Promise<CanvasContextType> {
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
    let sprite = viewport.addChild(new Sprite(Texture.WHITE));
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = 100;
    sprite.position.set(100, 100);
    sprite.eventMode = "static";

    sprite.on("pointerdown", (event) => {
        console.log("sprite 1");
        document.dispatchEvent(
            new CustomEvent("testevent", { detail: event.target.label }),
        );
    });

    sprite = viewport.addChild(new Sprite(Texture.WHITE));
    sprite.tint = 0xff00ff;
    sprite.width = sprite.height = 100;
    sprite.position.set(200, 100);
    sprite.eventMode = "static";
    sprite.cursor = "grabbing";
    sprite.label = "test sprite";

    let dragTarget: Sprite | null = null;
    let position: Point = new Point();

    function onDragEnd(_event: FederatedPointerEvent) {
        if (dragTarget) {
            viewport.off("pointermove", onDragMove);
            dragTarget.alpha = 1;
            dragTarget = null;
            viewport.pause = false;
        }
    }

    viewport.on("pointerup", onDragEnd);
    viewport.on("pointerupoutside", onDragEnd);

    function onDragMove(event: FederatedPointerEvent) {
        if (dragTarget) {
            const localPos = event.getLocalPosition(dragTarget.parent);
            dragTarget.position.set(
                localPos.x - position.x,
                localPos.y - position.y,
            );
        }
    }

    sprite.on(
        "pointerdown",
        (event) => {
            viewport.pause = true;
            sprite.alpha = 0.5;
            dragTarget = sprite;
            const localPos = event.getLocalPosition(sprite.parent);
            position.x = localPos.x - sprite.position.x;
            position.y = localPos.y - sprite.position.y;
            viewport.on("pointermove", onDragMove);
        },
        sprite,
    );

    sprite.on("pointerdown", (event) => {
        console.log("sprite 2");
        document.dispatchEvent(
            new CustomEvent("testevent", { detail: event.target.label }),
        );
    });

    return { app, viewport };
}
