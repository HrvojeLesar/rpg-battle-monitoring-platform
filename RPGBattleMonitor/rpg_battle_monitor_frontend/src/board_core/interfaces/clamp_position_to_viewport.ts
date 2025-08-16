import { Point } from "pixi.js";
import { SelectHandler } from "../handlers/select_handler";

export interface IClampPositionToViewport {
    clampPositionToViewport(
        newPosition: Point,
        selectHandler: SelectHandler,
    ): void;
}
