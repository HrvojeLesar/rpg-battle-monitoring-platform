import { Container, Sprite } from "pixi.js";
import { ContainerExtensionMixin, IContainerMixin } from "./container_mixin";

export const SpriteMixin = ContainerExtensionMixin(Sprite);
export const ContainerMixin = ContainerExtensionMixin(Container);

const mixinClasses = [SpriteMixin, ContainerMixin];

export function tryCastContainerAsMixin(
    instance: Container,
): Option<IContainerMixin> {
    if (isMixinInstance(instance)) {
        return instance as IContainerMixin;
    }

    return undefined;
}

export function isMixinInstance(instance: any): boolean {
    for (const mixinClass of mixinClasses) {
        if (instance instanceof mixinClass) {
            return true;
        }
    }

    return false;
}
