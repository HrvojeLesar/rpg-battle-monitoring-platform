import { Container, Sprite, Texture } from "pixi.js";
import { UniqueCollection } from "./unique_collection";

export type Ghost = Container;

export class ContainerGhostHandler {
    protected _ghots: UniqueCollection<Container> = new UniqueCollection();

    public constructor(public container: Container) {}

    public createGhost(): Ghost {
        const ghost = this.createGhostContainer();
        this._ghots.addItem(ghost);

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
        const removedGhost = this._ghots.removeItem(ghost);

        if (removedGhost) {
            this.removeFromContainerStage(ghost);
        }

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
            return new Container(this.container);
        }

        throw new Error(
            "Creating a ghost of an unhandled type:",
            this.container,
        );
    }

    protected cloneSprite(container: Sprite): Sprite {
        const clone = new Sprite(Texture.EMPTY);

        clone.tint = container.tint;
        clone.alpha = 0.65;
        clone.width = container.width;
        clone.height = container.height;
        clone.position.set(container.position.x, container.position.y);
        clone.eventMode = "passive";
        clone.texture = container.texture;

        return clone;
    }

    // TODO: Update this to use global stage.
    // For now we are trusting that the container is not deeply nested
    // and the stage is the parent
    private addToContainerStage(ghost: Ghost): void {
        this.container.parent.addChildAt(
            ghost,
            this.container.getChildIndex(this.container),
        );
    }

    // TODO: Update this to use global stage.
    // For now we are trusting that the container is not deeply nested
    // and the stage is the parent
    private removeFromContainerStage(ghost: Container): void {
        this.container.parent.removeChild(ghost);
    }
}
