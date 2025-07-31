import { ContainerMixin } from "./mixins/container_mixin";

export class Token {
    protected _container: ContainerMixin;

    public constructor(container: ContainerMixin) {
        this._container = container;
    }

    public get container(): ContainerMixin {
        return this._container;
    }
}
