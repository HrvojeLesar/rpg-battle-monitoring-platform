import { ContainerExtension } from "@/board_core/extensions/container_extension";
import { GridCell, GridCellPosition } from "@/board_core/grid/cell";
import { DragHandler } from "@/board_core/handlers/drag_handler";
import { EventStore } from "@/board_core/handlers/registered_event_store";
import { SelectHandler } from "@/board_core/handlers/select_handler";
import { Layer } from "@/board_core/layers/layers";
import { Scene } from "@/board_core/scene";
import { Container, FederatedPointerEvent, Graphics, Point } from "pixi.js";
import { Arrow } from "../graphics/arrow";
import { Grid } from "@/board_core/grid/grid";

class HighlightedCell extends Graphics {
    protected _gridCellPosition: GridCellPosition;

    constructor(gridCellPosition: GridCellPosition, grid: Grid) {
        super();

        this._gridCellPosition = gridCellPosition;

        this.position.set(
            gridCellPosition.x * grid.cellSize,
            gridCellPosition.y * grid.cellSize,
        );
        this.rect(0, 0, grid.cellSize, grid.cellSize).fill({
            color: "green",
            alpha: 0.5,
        });
    }

    public get gridCellPosition(): GridCellPosition {
        return this._gridCellPosition;
    }
}

export class RpgDragHandler extends DragHandler {
    protected startPositions: GridCell[] = [];
    protected dragLayer: Layer;

    public constructor(
        scene: Scene,
        selectHandler: SelectHandler,
        eventStore: EventStore,
    ) {
        super(scene, selectHandler, eventStore);

        this.dragLayer = this.scene.layers.getLayer({
            name: "drag",
            container: new Container({
                label: "dragLayer",
                eventMode: "none",
            }),
            zIndex: this.scene.layers.layers.length,
            label: "Drag layer",
        });
    }

    protected onGlobalPointerMove(
        offset: Point,
        container: ContainerExtension,
        event: FederatedPointerEvent,
    ) {
        super.onGlobalPointerMove(offset, container, event);

        this.selectHandler.selections.forEach((selection) => {
            const cell = selection.getGridCellPosition();
            const arrows = this.dragLayer.container.children.filter(
                (child) =>
                    child instanceof Arrow && child.forContainer === selection,
            ) as Arrow[];

            arrows.forEach((arrow) => {
                const cellSize = this.scene.grid.cellSize;
                const endPoint = new Point(
                    cell.x * cellSize + cellSize / 2,
                    cell.y * cellSize + cellSize / 2,
                );
                arrow.setTo(endPoint);
                arrow.visible = true;

                const startPoint = arrow.getFrom();
                const cells = this.shortestPath(
                    this.raycast(startPoint, endPoint),
                );

                cells.forEach((cell) => {
                    cell.visible = true;
                });
            });
        });
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
            const cell = selection.getGridCellPosition();
            this.startPositions.push(cell);
            const cellSize = this.scene.grid.cellSize;
            const startPoint = new Point(
                cell.x * cellSize + cellSize / 2,
                cell.y * cellSize + cellSize / 2,
            );
            this.dragLayer.container.addChild(
                new Arrow({
                    from: startPoint,
                    to: startPoint,
                    forContainer: selection,
                    visible: false,
                }),
            );
        });
    }

    protected override onPointerUp(): void {
        super.onPointerUp();

        const children = [...this.dragLayer.container.children];
        children.forEach((child) => {
            child.destroy(true);
        });
    }

    // TODO: credit https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
    // TODO: credit https://playtechs.blogspot.com/2007/03/raytracing-on-grid.html
    protected raycast(startPoint: Point, endPoint: Point): HighlightedCell[] {
        this.destroyHighlights();

        const derivedPoint = new Point(
            Math.abs(endPoint.x - startPoint.x),
            Math.abs(endPoint.y - startPoint.y),
        );
        const point = new Point(startPoint.x, startPoint.y);

        // WARN: this checks every pixel and can be quite inefficient because most of the time the same cell is tested
        let numberOfPointsOnScreen = 1 + derivedPoint.x + derivedPoint.y;

        const increment = new Point(
            endPoint.x > startPoint.x ? 1 : -1,
            endPoint.y > startPoint.y ? 1 : -1,
        );
        let error = derivedPoint.y - derivedPoint.y;

        derivedPoint.x *= 2;
        derivedPoint.y *= 2;

        const cellPoints: HighlightedCell[] = [];
        for (; numberOfPointsOnScreen > 0; --numberOfPointsOnScreen) {
            const cellPoint = this.highlightCell(point);
            if (cellPoint !== undefined) {
                cellPoints.push(cellPoint);
            }
            if (error > 0) {
                point.x += increment.x;
                error -= derivedPoint.y;
            } else {
                point.y += increment.y;
                error += derivedPoint.x;
            }
        }

        return cellPoints;
    }

    protected highlightCell(point: Point): Maybe<HighlightedCell> {
        const cell = GridCell.getGridCellFromPoint(point, this.scene.grid);

        const existingHighlight = this.dragLayer.container.children.find(
            (child) =>
                child instanceof HighlightedCell &&
                child.gridCellPosition.x === cell.x &&
                child.gridCellPosition.y === cell.y,
        );
        if (existingHighlight === undefined) {
            const highlightCell = new HighlightedCell(cell, this.scene.grid);
            this.dragLayer.container.addChild(highlightCell);
            highlightCell.visible = false;

            return highlightCell;
        }

        return undefined;
    }

    protected destroyHighlights() {
        const children = [...this.dragLayer.container.children];

        children.forEach((child) => {
            if (child instanceof HighlightedCell) {
                child.destroy(true);
            }
        });
    }

    protected shortestPath(cells: HighlightedCell[]): HighlightedCell[] {
        if (cells.length < 2) {
            return [];
        }

        const startingPoint = cells[0];
        const endPoint = cells[cells.length - 1];

        const generateKeyRaw = (x: number, y: number) => `${x},${y}`;
        const generateKey = (p: Point) => `${p.x},${p.y}`;
        const pointsMap = new Map(
            cells.map((cell) => [generateKey(cell.gridCellPosition), cell]),
        );

        const directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
        ];
        const queue: HighlightedCell[] = [startingPoint];
        const visited = new Set([generateKey(startingPoint.gridCellPosition)]);
        const cellsGraphMap = new Map<string, HighlightedCell | undefined>([
            [generateKey(startingPoint.gridCellPosition), undefined],
        ]);

        while (queue.length > 0) {
            const cell = queue.shift()!;
            const current = cell.gridCellPosition;

            if (current.x === endPoint.x && current.y === endPoint.y) {
                break;
            }

            for (const [dx, dy] of directions) {
                const x = current.x + dx;
                const y = current.y + dy;
                const adjacentPointKey = generateKeyRaw(x, y);
                if (
                    pointsMap.has(adjacentPointKey) &&
                    !visited.has(adjacentPointKey)
                ) {
                    const adjacentPoint = pointsMap.get(adjacentPointKey)!;
                    visited.add(adjacentPointKey);
                    queue.push(adjacentPoint);

                    cellsGraphMap.set(adjacentPointKey, cell);
                }
            }
        }

        const outputCells: HighlightedCell[] = [endPoint];
        let nextCellKey: Maybe<string> = generateKey(endPoint.gridCellPosition);
        if (!cellsGraphMap.has(nextCellKey)) {
            return [];
        }

        while (nextCellKey !== undefined) {
            const cell = cellsGraphMap.get(nextCellKey);
            if (cell !== undefined) {
                outputCells.push(cell);
            }
            nextCellKey = cell ? generateKey(cell.gridCellPosition) : undefined;
        }

        outputCells.reverse();

        return outputCells;
    }
}
