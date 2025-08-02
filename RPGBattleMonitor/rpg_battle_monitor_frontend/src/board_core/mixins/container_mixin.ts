import { Container } from "pixi.js";
import { ContainerGhostHandler, Ghost } from "../utils/ghost";
import { GBoard } from "../board";

export type Constructor<T = {}> = new (...args: any[]) => T;

interface ContainerMixinOptions {
    isSnapping: boolean;
    isDraggable: boolean;
    isSelectable: boolean;
}

export interface IContainerMixin extends ContainerMixinOptions, Container {
    createGhost(): Ghost;
    popGhost(): Option<Ghost>;
    removeGhost(ghost: Ghost): Option<Ghost>;
    clearGhosts(): void;
}

export function ContainerExtensionMixin<T extends Constructor<Container>>(
    Base: T,
) {
    return class ContainerExtension extends Base implements IContainerMixin {
        protected _isSnapping: boolean = false;
        protected _isDraggable: boolean = false;
        protected _isSelectable: boolean = false;
        protected _ghostHandler: ContainerGhostHandler;

        public constructor(...args: any[]) {
            super(...args);

            let options = (args[0] || {}) as ContainerMixinOptions;

            this._ghostHandler = new ContainerGhostHandler(this);

            this.isSnapping = options.isSnapping || false;
            this.isDraggable = options.isDraggable || false;
            this.isSelectable = options.isSelectable || false;

            // WARN: Order matters
            this.registerSelectable();
            this.registerDraggable();
        }

        public get isSnapping(): boolean {
            return this._isSnapping;
        }

        public set isSnapping(value: boolean) {
            this._isSnapping = value;
        }

        public createGhost(): Ghost {
            return this._ghostHandler.createGhost();
        }

        public popGhost(): Option<Ghost> {
            return this._ghostHandler.popGhost();
        }

        public removeGhost(ghost: Ghost): Option<Ghost> {
            return this._ghostHandler.removeGhost(ghost);
        }

        public clearGhosts(): void {
            this._ghostHandler.clearGhosts();
        }

        public get isDraggable(): boolean {
            return this._isDraggable;
        }

        public set isDraggable(value: boolean) {
            this._isDraggable = value;
        }

        public get isSelectable(): boolean {
            return this._isSelectable;
        }

        public set isSelectable(value: boolean) {
            this._isSelectable = value;
        }

        public cleanup() {
            this.unregisterDraggable();
            this.unregisterSelectable();
        }

        private registerDraggable() {
            GBoard.dragHandler.registerDrag(this);
        }

        private unregisterDraggable() {
            GBoard.dragHandler.unregisterDrag(this);
        }

        private registerSelectable() {
            GBoard.selectHandler.registerSelect(this);
        }

        private unregisterSelectable() {
            GBoard.selectHandler.unregisterSelect(this);
        }
    };
}
