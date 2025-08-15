import { Container, Point } from "pixi.js";
import { UniqueCollection } from "./unique_collection";
import { IClampPositionToViewport } from "../interfaces/clamp_position_to_viewport";

export class ClampPositionRegistry {
    private static instance: ClampPositionRegistry;

    protected _clampers: UniqueCollection<IClampPositionToViewport> =
        new UniqueCollection();

    private constructor() {}

    public static get(): ClampPositionRegistry {
        if (!ClampPositionRegistry.instance) {
            ClampPositionRegistry.instance = new ClampPositionRegistry();
        }

        return ClampPositionRegistry.instance;
    }

    public register(clamp: IClampPositionToViewport): void {
        this._clampers.add(clamp);
    }

    public tryClamp(
        container: Container,
        newPosition: Point,
        data?: any,
    ): void {
        for (const clamp of this._clampers.items) {
            if (clamp.supports(container)) {
                clamp.clampPositionToViewport(container, newPosition, data);
                return;
            }
        }
    }
}

export const GClampPositionRegistry = ClampPositionRegistry.get();
