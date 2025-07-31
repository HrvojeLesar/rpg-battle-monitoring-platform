import { IContainerMixin } from "./mixins/container_mixin";

export class Token {
    protected _container: IContainerMixin;

    public constructor(container: IContainerMixin) {
        this._container = container;
    }

    public get container(): IContainerMixin {
        return this._container;
    }
}
