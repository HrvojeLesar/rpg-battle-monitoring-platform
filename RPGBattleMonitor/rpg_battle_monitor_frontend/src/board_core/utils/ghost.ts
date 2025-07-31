import { Container, Sprite, Texture } from "pixi.js";
import { UniqueCollection } from "./unique_collection";
import { GBoard } from "../board";
import { IContainerMixin } from "../mixins/container_mixin";
import { ContainerMixin, SpriteMixin } from "../mixins/mixin_classess";

export type Ghost = IContainerMixin;

export class ContainerGhostHandler {
    protected _ghots: UniqueCollection<IContainerMixin> =
        new UniqueCollection();

    public constructor(public container: Container) {}

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
        while (!this._ghots.isEmpty()) {
            const ghost = this._ghots.pop();
            if (ghost) {
                this.removeGhost(ghost);
            }
        }
    }

    protected createGhostContainer(): Ghost {
        if (this.container instanceof Sprite) {
            return this.cloneSprite(this.container);
        }

        if (this.container instanceof Container) {
            return new ContainerMixin(this.container);
        }

        throw new Error(
            "Creating a ghost of an unhandled type:",
            this.container,
        );
    }

    protected cloneSprite(container: Sprite): IContainerMixin {
        const clone = new SpriteMixin(Texture.EMPTY);

        clone.tint = container.tint;
        clone.alpha = 0.65;
        clone.width = container.width;
        clone.height = container.height;
        clone.position.set(container.position.x, container.position.y);
        clone.eventMode = "passive";
        clone.texture = container.texture;

        return clone;
    }

    private addToContainerStage(ghost: Ghost): void {
        GBoard.viewport.addChildAt(
            ghost,
            GBoard.viewport.getChildIndex(this.container),
        );
    }

    private removeFromContainerStage(ghost: Container): void {
        GBoard.viewport.removeChild(ghost);
    }
}
