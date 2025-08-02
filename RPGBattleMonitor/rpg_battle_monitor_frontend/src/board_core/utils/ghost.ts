import {
    Container,
    ContainerOptions,
    Point,
    Sprite,
    SpriteOptions,
    Texture,
} from "pixi.js";
import { UniqueCollection } from "./unique_collection";
import { GBoard } from "../board";
import {
    ContainerExtension,
    ContainerExtensionOptions,
} from "../extensions/container_extension";
import { SpriteExtension } from "../extensions/sprite_extension";
import { event } from "@tauri-apps/api";

export type Ghost = ContainerExtension;

export class ContainerGhostHandler {
    protected _ghots: UniqueCollection<ContainerExtension> =
        new UniqueCollection();

    public constructor(public container: ContainerExtension) {}

    public createGhost(): Ghost {
        const ghost = this.createGhostContainer();
        this._ghots.add(ghost);

        this.addToContainerStage(ghost);

        return ghost;
    }

    public popGhost(): Option<Ghost> {
        const ghost = this._ghots.pop();

        if (ghost) {
            this.removeFromContainerStage(ghost);
        }

        return ghost;
    }

    public removeGhost(ghost: Ghost): Option<Ghost> {
        const removedGhost = this._ghots.remove(ghost);

        this.removeFromContainerStage(ghost);

        return removedGhost;
    }

    public clearGhosts(): void {
        const ghosts = this._ghots.clear();

        for (const ghost of ghosts) {
            this.removeFromContainerStage(ghost);
        }
    }

    protected createGhostContainer(): Ghost {
        if (this.container.displayedEntity instanceof Sprite) {
            return new SpriteExtension(
                this.cloneSpriteOptions(this.container.displayedEntity),
                this.cloneContainerOptions(this.container),
            );
        }

        if (this.container instanceof ContainerExtension) {
            return new ContainerExtension(this.container);
        }

        throw new Error(
            "Creating a ghost of an unhandled type:",
            this.container,
        );
    }

    protected cloneSpriteOptions(container: Sprite): SpriteOptions {
        return {
            alpha: 0.65,
            tint: container.tint,
            width: container.width,
            height: container.height,
            eventMode: "passive",
            texture: container.texture,
        };
    }

    protected cloneContainerOptions(
        container: ContainerExtension,
    ): ContainerExtensionOptions {
        return {
            position: new Point(container.position.x, container.position.y),
            eventMode: "passive",
        };
    }

    private addToContainerStage(ghost: Ghost): void {
        if (!this.container.displayedEntity) {
            return;
        }

        GBoard.viewport.addChildAt(
            ghost,
            GBoard.viewport.getChildIndex(this.container),
        );
    }

    private removeFromContainerStage(ghost: Container): void {
        GBoard.viewport.removeChild(ghost);
    }
}
