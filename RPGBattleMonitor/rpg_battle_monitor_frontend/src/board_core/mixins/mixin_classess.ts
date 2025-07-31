import { Container, Sprite } from "pixi.js";
import { ContainerExtensionMixin } from "./container_mixin";

export const SpriteMixin = ContainerExtensionMixin(Sprite);
export const ContainerMixin = ContainerExtensionMixin(Container);
