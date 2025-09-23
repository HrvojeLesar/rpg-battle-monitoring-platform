import { GBoard } from "@/board_core/board";
import { RpgScene, RpgSceneOptions } from "../scene/scene";

export class RpgSceneFactory {
    public static createScene(options: RpgSceneOptions): RpgScene {
        const scene = new RpgScene(options);

        GBoard.entityRegistry.entities.add(scene);

        GBoard.websocket.queue(scene.grid, "createQueue");
        GBoard.websocket.queue(scene, "createQueue");

        GBoard.websocket.flush();

        return scene;
    }
}
