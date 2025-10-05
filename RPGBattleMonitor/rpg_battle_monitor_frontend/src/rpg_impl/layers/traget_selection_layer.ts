import { WORLD_SIZE } from "@/board_core/scene";
import { Container, Graphics, Point } from "pixi.js";
import { RpgScene } from "../scene/scene";

export class TargetSelectionLayer extends Container {
    public scene: RpgScene;
    public background: Graphics;

    public constructor(scene: RpgScene) {
        super({
            label: "targetSelectionLayer",
            eventMode: "none",
            position: new Point(0, 0),
        });

        this.scene = scene;

        this.background = new Graphics({
            eventMode: "static",
        });
        this.background.rect(0, 0, WORLD_SIZE, WORLD_SIZE);
        this.background.fill({
            color: {
                r: 0,
                g: 0,
                b: 0,
                a: 0,
            },
        });

        this.addChild(this.background);
    }

    public activate() {
        this.scene.selectHandler.pause = true;
        this.scene.selectHandler.clearSelections();
        this.eventMode = "static";
    }

    public deactivate() {
        this.eventMode = "none";
        this.scene.selectHandler.pause = false;
        const children = [...this.children];

        children
            .filter((child) => child !== this.background)
            .forEach((child) => {
                child.destroy(true);
            });
    }
}
