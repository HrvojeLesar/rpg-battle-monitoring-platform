import {} from "pixi.js";

declare module "pixi.js" {
    export interface Container {
        snapToGrid?: boolean;
    }
}
