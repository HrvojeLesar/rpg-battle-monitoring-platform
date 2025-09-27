import { ContainerExtension } from "@/board_core/extensions/container_extension";
import { GridCell } from "@/board_core/grid/cell";
import { DragHandler } from "@/board_core/handlers/drag_handler";
import { EventStore } from "@/board_core/handlers/registered_event_store";
import { SelectHandler } from "@/board_core/handlers/select_handler";
import { Layer } from "@/board_core/layers/layers";
import { FederatedPointerEvent, Point } from "pixi.js";
import { Arrow } from "../graphics/arrow";
import { RpgToken } from "../tokens/rpg_token";
import { DistanceDisplay } from "../graphics/distance_display";
import { HighlightedCell } from "../graphics/highlighted_cell";
import { RpgScene } from "../scene/scene";
import { queueEntityUpdate } from "@/websocket/websocket";
import { Token } from "@/board_core/token/token";
import { IMessagable } from "@/board_core/interfaces/messagable";
import { TurnOrder } from "../turn/turn_order";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { turnOrderAtoms } from "../stores/turn_order_store";
import { raycast } from "../utils/raycast";
import { shortestPath } from "../utils/highlighted_cells_shortest_path";

export const CELL_FT = 5;

export class RpgDragHandler extends DragHandler {
    protected dragLayer: Layer;
    protected distanceDisplays: DistanceDisplay[] = [];
    protected rpgTokenInitialPositions: Map<RpgToken, Point> = new Map();
    declare protected scene: RpgScene;

    public constructor(
        scene: RpgScene,
        selectHandler: SelectHandler,
        eventStore: EventStore,
    ) {
        super(scene, selectHandler, eventStore);

        this.dragLayer = scene.dragLayer;
    }

    protected onGlobalPointerMove(
        offset: Point,
        token: ContainerExtension,
        event: FederatedPointerEvent,
    ) {
        super.onGlobalPointerMove(offset, token, event);

        if (!(token instanceof RpgToken)) {
            return;
        }

        const cell = token.getGridCellPosition();
        const arrow = this.dragLayer.container.children.find(
            (child) => child instanceof Arrow && child.token === token,
        ) as Maybe<Arrow>;

        if (arrow === undefined) {
            return;
        }

        const cellSize = this.scene.grid.cellSize;
        const endPoint = new Point(
            cell.x * cellSize + cellSize / 2,
            cell.y * cellSize + cellSize / 2,
        );

        arrow.setTo(endPoint);
        arrow.visible = true;

        const startPoint = arrow.startPoint;
        const cells = this.shortestPath(
            this.raycast(startPoint, endPoint, token),
        );

        cells.forEach((cell) => {
            cell.visible = true;
        });

        const distanceDisplay = this.findDistanceDisplay(token);

        if (distanceDisplay !== undefined)
            if (cells.length > 0) {
                distanceDisplay.visible = true;
                distanceDisplay.distance = this.getDistanceInFt(cells);
            } else {
                distanceDisplay.visible = false;
            }
    }

    protected override onPointerDown(event: FederatedPointerEvent) {
        super.onPointerDown(event);

        const children = [...this.dragLayer.container.children];
        children.forEach((child) => {
            if (child instanceof HighlightedCell) {
                child.destroy(true);
            }
        });

        this.selectHandler.selections.forEach((selection) => {
            if (!(selection instanceof RpgToken)) {
                return;
            }

            this.rpgTokenInitialPositions.set(
                selection,
                new Point(selection.position.x, selection.position.y),
            );

            if (
                this.distanceDisplays.find((d) => d.token === selection) ===
                undefined
            ) {
                this.distanceDisplays.push(
                    new DistanceDisplay({
                        token: selection,
                    }),
                );
            }

            this.dragLayer.container.addChild(
                new Arrow({
                    token: selection,
                    scene: this.scene,
                    visible: false,
                }),
            );
        });
    }

    protected override onPointerUp(): void {
        this.globalPointerMoveUnregisterHandle.forEach((handle) => {
            this.scene.viewport.off("globalpointermove", handle);
        });
        this.globalPointerMoveUnregisterHandle = [];

        const selectedItems = this.selectHandler.selections;
        const updatedItems: IMessagable[] = [];
        for (const container of selectedItems) {
            if (container instanceof RpgToken) {
                this.moveContainer(container, updatedItems);
            } else {
                super.moveContainer(container, updatedItems);
            }
        }

        this.selectHandler.drawSelectionOutline();

        this.isDirty = false;

        queueEntityUpdate(() => {
            return updatedItems.filter(
                (item) => item instanceof Token || item instanceof TurnOrder,
            );
        });

        const children = [...this.dragLayer.container.children];
        children.forEach((child) => {
            child.destroy(true);
        });

        this.distanceDisplays.forEach((d) => {
            d.destroy(true);
        });

        this.distanceDisplays = [];
        this.rpgTokenInitialPositions.clear();
    }

    // TODO: credit https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
    // TODO: credit https://playtechs.blogspot.com/2007/03/raytracing-on-grid.html
    protected raycast(
        startPoint: Point,
        endPoint: Point,
        token: RpgToken,
    ): HighlightedCell[] {
        const cellPoints: HighlightedCell[] = [];

        raycast(startPoint, endPoint, {
            start: () => {
                this.destroyHighlights(token);
            },
            onPoint: (point) => {
                const cellPoint = this.highlightCell(point, token);
                if (cellPoint !== undefined) {
                    cellPoints.push(cellPoint);
                }
            },
        });

        return cellPoints;
    }

    protected highlightCell(
        point: Point,
        token: RpgToken,
    ): Maybe<HighlightedCell> {
        const cell = GridCell.getGridCellFromPoint(point, this.scene.grid);

        const existingHighlight = this.dragLayer.container.children.find(
            (child) =>
                child instanceof HighlightedCell &&
                child.gridCellPosition.x === cell.x &&
                child.gridCellPosition.y === cell.y &&
                child.token === token,
        );

        if (existingHighlight === undefined) {
            const highlightCell = new HighlightedCell(
                cell,
                this.scene.grid,
                token,
            );
            this.dragLayer.container.addChild(highlightCell);
            highlightCell.visible = false;

            return highlightCell;
        }

        return undefined;
    }

    protected destroyHighlights(rpgToken: RpgToken) {
        const children = [...this.dragLayer.container.children];

        children.forEach((child) => {
            if (child instanceof HighlightedCell && child.token === rpgToken) {
                child.destroy(true);
            }
        });
    }

    // TODO: credit https://en.wikipedia.org/wiki/Breadth-first_search
    // TODO: account for larger token size e.g. 2x2
    protected shortestPath(cells: HighlightedCell[]): HighlightedCell[] {
        return shortestPath(cells);
    }

    protected getDistanceInFt(cells: HighlightedCell[]): number {
        if (cells.length < 2) {
            return 0;
        }

        const cellCount = cells.length - 1;

        return cellCount * CELL_FT;
    }

    protected findDistanceDisplay(token: RpgToken): Maybe<DistanceDisplay> {
        return this.distanceDisplays.find((d) => d.token === token);
    }

    protected canTokenBeMoved(token: RpgToken): boolean {
        const turnOrder = this.getTurnOrder();
        if (turnOrder === undefined || !turnOrder.isInCombat()) {
            return true;
        }

        if (!turnOrder.isOnTurn(token)) {
            return false;
        }

        const distanceDisplay = this.findDistanceDisplay(token);
        if (distanceDisplay === undefined) {
            return false;
        }

        const entry = turnOrder.getToken(token);
        if (entry === undefined) {
            return false;
        }

        if (distanceDisplay.distance > entry.speed) {
            return false;
        }

        entry.speed -= distanceDisplay.distance;

        return true;
    }

    protected moveContainer(
        token: RpgToken,
        updatedItems: IMessagable[],
    ): void {
        token.clearGhosts();

        if (!this.isDirty) {
            return;
        }

        const canTokenBeMoved = this.canTokenBeMoved(token);
        if (canTokenBeMoved) {
            super.moveContainer(token, updatedItems);
            const turnOrder = this.getTurnOrder();
            if (turnOrder !== undefined) {
                updatedItems.push(turnOrder);
            }

            GAtomStore.set(turnOrderAtoms.currentTurnOrder);
        } else {
            const initialPos = this.rpgTokenInitialPositions.get(token);
            if (initialPos === undefined) {
                console.error("No initial position found for token", token);
                super.moveContainer(token, updatedItems);
                return;
            }

            token.position.set(initialPos.x, initialPos.y);
            token.snapToGrid();
        }
    }

    protected getTurnOrder(): Maybe<TurnOrder> {
        const scene = this.scene as RpgScene;
        return scene.turnOrder;
    }
}
