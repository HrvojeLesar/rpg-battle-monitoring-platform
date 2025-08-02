import { ContainerExtension } from "./extensions/container_extension";

export class Token {
    protected _container: ContainerExtension;

    public constructor(container: ContainerExtension) {
        this._container = container;
    }

    public get container(): ContainerExtension {
        return this._container;
    }
}
