import { Container, FederatedPointerEvent, Point } from "pixi.js";
import { ContainerGhostHandler, Ghost } from "../utils/ghost";
import { GBoard } from "../board";

export type Constructor<T = {}> = new (...args: any[]) => T;

interface ContainerMixinOptions {
    isSnapping: boolean;
    isMovable: boolean;
}

export interface ContainerMixin extends ContainerMixinOptions, Container {
    snapToGrid(force?: boolean): void;
    createGhost(): Ghost;
    popGhost(): Option<Ghost>;
    removeGhost(ghost: Ghost): Option<Ghost>;
    clearGhosts(): void;
}

export function ContainerExtensionMixin<T extends Constructor<Container>>(
    Base: T,
) {
    return class ContainerExtension extends Base implements ContainerMixin {
        protected _isSnapping: boolean;
        protected _isMovable: boolean;
        protected _ghostHandler: ContainerGhostHandler;

        public constructor(...args: any[]) {
            super(...args);

            let options = (args[0] || {}) as ContainerMixinOptions;

            this._ghostHandler = new ContainerGhostHandler(this);

            this._isSnapping = options.isSnapping || false;
            this._isMovable = options.isMovable || false;

            if (this._isMovable) {
                this.eventMode = "static";
            }
        }

        public get isSnapping(): boolean {
            return this._isSnapping;
        }

        public set isSnapping(value: boolean) {
            this._isSnapping = value;
        }

        public snapToGrid(force: boolean = false) {
            if (this.isSnapping === false && force === false) {
                return;
            }

            this.position.x =
                Math.round(this.position.x / GBoard.grid.cellSize) *
                GBoard.grid.cellSize;
            this.position.y =
                Math.round(this.position.y / GBoard.grid.cellSize) *
                GBoard.grid.cellSize;
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

        public get isMovable(): boolean {
            return this._isMovable;
        }

        public set isMovable(value: boolean) {
            this._isMovable = value;
            if (this._isMovable) {
                this.eventMode = "static";
                this.registerMovable();
            } else {
                this.eventMode = "passive";
                this.unregisterMovable();
            }
        }

        private registerMovable() {
            const offset = new Point();

            const onPointerDown = (event: FederatedPointerEvent) => {
                if (event.pointerType === "mouse" && event.button !== 0) {
                    return;
                }

                const localPos = event.getLocalPosition(GBoard.viewport);
                offset.x = localPos.x - this.x;
                offset.y = localPos.y - this.y;
                GBoard.viewport.pause = true;

                // this.createGhost();

                GBoard.viewport.onglobalpointermove = (event) => {
                    const localPos = event.getLocalPosition(GBoard.viewport);
                    const newEntityPosition = new Point(
                        localPos.x - offset.x,
                        localPos.y - offset.y,
                    );

                    this.clampPositionToViewport(newEntityPosition);
                    this.position.set(newEntityPosition.x, newEntityPosition.y);
                };
            };

            const onPointerUp = (_event: FederatedPointerEvent) => {
                GBoard.viewport.onglobalpointermove = null;
                GBoard.viewport.pause = false;

                this.snapToGrid();
                // this.removeGhosts();
            };

            this.onpointerdown = onPointerDown;
            this.onpointerup = onPointerUp;
            this.onpointerupoutside = onPointerUp;
        }

        private unregisterMovable() {
            this.onpointerdown = null;
            this.onpointerup = null;
            this.onpointerupoutside = null;
        }

        private clampPositionToViewport(position: Point) {
            const worldWidth = GBoard.viewport.worldWidth;
            const worldHeight = GBoard.viewport.worldHeight;

            if (position.x < 0) {
                position.x = 0;
            }

            if (position.y < 0) {
                position.y = 0;
            }

            if (position.x + this.width > worldWidth) {
                position.x = worldWidth - this.width;
            }

            if (position.y + this.height > worldHeight) {
                position.y = worldHeight - this.height;
            }
        }
    };
}
