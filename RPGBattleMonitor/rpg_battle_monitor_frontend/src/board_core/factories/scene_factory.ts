import { GBoard } from "../board";
import { Scene, SceneOptions } from "../scene";

export class SceneFactory {
    public static createScene(options: SceneOptions): Scene {
        const scene = new Scene(options);

        GBoard.websocket.queue(scene.grid, "createQueue");
        GBoard.websocket.queue(scene, "createQueue");

        GBoard.websocket.flush();

        return scene;
    }
}
