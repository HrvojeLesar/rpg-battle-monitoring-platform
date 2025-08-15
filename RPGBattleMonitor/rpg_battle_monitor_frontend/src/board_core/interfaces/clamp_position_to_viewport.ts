import { Container, Point } from "pixi.js";

export interface IClampPositionToViewport {
    supports(container: Container): boolean;
    clampPositionToViewport(
        container: Container,
        newPosition: Point,
        data?: any,
    ): void;
}
