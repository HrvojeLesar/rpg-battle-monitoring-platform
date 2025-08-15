import { ObservablePoint, Point } from "pixi.js";
import { ResizeKind } from "../handlers/resize_handler";

export interface IResizable {
    getInitialPosition(): ObservablePoint;
    getInitialHeight(): number;
    getInitialWidth(): number;
    resize(
        pointerPosition: Point,
        startPoint: Point,
        initialWidth: number,
        initialHeight: number,
        kind: ResizeKind,
    ): void;
}
