import { Container, ContainerChild, ContainerOptions } from "pixi.js";
import { ContainerGhostHandler, Ghost } from "../utils/ghost";
import { UniqueCollection } from "../utils/unique_collection";

class ContainerMixin extends Container {
    protected _canSnapToGrid: boolean = false;
    protected _ghostHandler: ContainerGhostHandler;

    public constructor(options?: ContainerOptions<ContainerChild>) {
        super(options);

        this._ghostHandler = new ContainerGhostHandler(this);
    }

    public get canSnapToGrid(): boolean {
        return this._canSnapToGrid;
    }

    public set canSnapToGrid(value: boolean) {
        this._canSnapToGrid = value;
    }

    public createGhost(): Ghost {
        return this._ghostHandler.createGhost();
    }

    public popGhost(): Option<Ghost> {
        return this._ghostHandler.popGhost();
    }

    public removeGhost(ghost: Ghost): Option<Ghost> {
        return this._ghostHandler.removeGhost(ghost);
    }

    public clearGhosts(): void {
        this._ghostHandler.clearGhosts();
    }
}
