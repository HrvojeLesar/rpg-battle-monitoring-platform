import { Application } from "pixi.js";
import { PositionManager } from "./position_manager";
import { SelectionManager } from "./selection_manager";

interface ApplicationManagerOptions {
    positionManager?: PositionManager;
    selectionManager?: SelectionManager;
}

export class ApplicationManager {
    protected app: Application;

    protected positionManager: PositionManager;

    protected selectionManager: SelectionManager;

    constructor(app: Application, options?: ApplicationManagerOptions) {
        this.app = app;
        this.selectionManager =
            options?.selectionManager ?? new SelectionManager(this.app);
        this.positionManager =
            options?.positionManager ??
            new PositionManager(this.app, this.selectionManager);
    }
}
