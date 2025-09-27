import { Container } from "pixi.js";

export type Layer = {
    name: string;
    container: Container;
    zIndex: number;
    label?: string;
};

export function defaultLayers() {
    let zIndex = 0;

    return [
        {
            name: "gridBackground",
            container: new Container({
                label: "gridBackgroundLayer",
                eventMode: "none",
            }),
            zIndex: zIndex++,
            label: "Grid background",
        },
        {
            name: "grid",
            container: new Container({ label: "gridLayer", eventMode: "none" }),
            zIndex: zIndex++,
            label: "Grid",
        },
        {
            name: "token",
            container: new Container({
                label: "tokenLayer",
                eventMode: "none",
            }),
            zIndex: zIndex++,
            label: "Token",
        },
    ];
}

type LayerCollection = Layer[];

export class Layers {
    protected _layers: LayerCollection;

    /**
     * Constructs layers, adding default layers if they are missing
     * Default layers are gridBackground:0, grid:1, token:2 (number indicates zIndex)
     * */
    public constructor(layers: LayerCollection) {
        this._layers = layers;

        const defaultLayersCollection = defaultLayers();

        for (const layer of defaultLayersCollection) {
            if (this._layers.find((l) => l.name === layer.name) === undefined) {
                this._layers.push(layer);
            }
        }

        this.sortLayers();
    }

    protected getLayerFromString(name: string): Layer {
        let layer = this._layers.find((layer) => layer.name === name);

        if (layer === undefined) {
            layer = { name, container: new Container(), zIndex: 0 };

            this._layers.push(layer);
        }

        return layer;
    }

    protected getLayerFromObject(inputLayer: Layer): Layer {
        const layer = this.getLayerFromString(inputLayer.name);

        layer.container = inputLayer.container;
        layer.zIndex = inputLayer.zIndex;
        layer.label = inputLayer.label;

        return layer;
    }

    public getLayer(layer: Layer | string): Layer {
        if (typeof layer === "object") {
            return this.getLayerFromObject(layer);
        }

        return this.getLayerFromString(layer);
    }

    public get gridLayer(): Container {
        return this.getLayer("grid").container;
    }

    public get tokenLayer(): Container {
        return this.getLayer("token").container;
    }

    public get gridBackgroundLayer(): Container {
        return this.getLayer("gridBackground").container;
    }

    public static getDefaultLayers(): Layers {
        return new Layers([...defaultLayers()]);
    }

    public get layers(): Readonly<Layer[]> {
        return [...this._layers];
    }

    public sortLayers(): void {
        this._layers.sort((a, b) => {
            return a.zIndex - b.zIndex;
        });
    }
}
