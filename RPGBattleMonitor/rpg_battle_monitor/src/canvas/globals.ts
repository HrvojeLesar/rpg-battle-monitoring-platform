import { Application, ApplicationOptions } from "pixi.js";

const app: Application = new Application();

export async function initGlobalCanvas(options?: Partial<ApplicationOptions>) {
    options = options ?? defaultOptions();
    await app.init(options);
}

function defaultOptions(): Partial<ApplicationOptions> {
    return {
        resolution: window.devicePixelRatio,
        autoDensity: true,
        antialias: true,
        roundPixels: true,
    };
}

const G = {
    app,
};

export default G;
