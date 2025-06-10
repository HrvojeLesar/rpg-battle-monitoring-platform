import { Container, Sprite, Texture } from "pixi.js";

export function createGhost(container: Container): Container {
    if (container instanceof Sprite) {
        return cloneSprite(container);
    }

    if (container instanceof Container) {
        return new Container(container);
    }

    throw new Error("Creating a ghost of an unhandled type:", container);
}

function cloneSprite(container: Sprite): Sprite {
    const clone = new Sprite(Texture.WHITE);

    clone.tint = container.tint;
    clone.alpha = 0.65;
    clone.width = container.width;
    clone.height = container.height;
    clone.position.set(container.position.x, container.position.y);
    clone.eventMode = "passive";
    clone.texture = container.texture;

    return clone;
}
