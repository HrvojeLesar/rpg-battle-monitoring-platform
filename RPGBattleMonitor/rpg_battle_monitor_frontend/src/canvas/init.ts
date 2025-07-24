import { Application, Assets, Sprite, Texture } from "pixi.js";
import "./pixi_extensions/container";
import { ApplicationManager } from "./managers/application_manager";
import { ReactPixiJsBridgeEventEmitter } from "../types/event_emitter";
import { Socket } from "socket.io-client";

export function init(
    app: Application,
    eventEmitter: ReactPixiJsBridgeEventEmitter,
    socket: Socket,
): ApplicationManager {
    const applicationManager = ApplicationManager.default(app, eventEmitter);

    socket.emit("join", { session_id: 1 });
    socket.on("board", (board) => {
        applicationManager.grid.cellSize = board.cell_size;
        applicationManager.grid.size = board.size;

        eventEmitter.emit("update-grid", board);
    });

    app.canvas.ondrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const grid = applicationManager.grid;
    const entityManager = applicationManager.entityManager;

    let sprite = new Sprite(Texture.WHITE);
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = grid.cellSize * 3;
    sprite.position.set(64, 64);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.canSnapToGrid = true;
    sprite.alpha = 0.5;

    entityManager.addPlayableEntity(sprite);

    const texturePromise = Assets.load<Texture>(
        "http://localhost:3000/api/v1/assets/47508f0b-2e5f-4816-924a-51c90688a670.jpeg",
        (progress) => {
            console.log("Progress: ", progress);
        },
    );
    texturePromise.then((texture) => {
        sprite.texture = texture;
    });

    sprite = new Sprite(Texture.WHITE);
    sprite.width = sprite.height = grid.cellSize * 3;
    sprite.position.set(128, 128);
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.canSnapToGrid = true;

    entityManager.addPlayableEntity(sprite);

    return applicationManager;
}
