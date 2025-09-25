import { Point } from "pixi.js";
import { HighlightedCell } from "../graphics/highlighted_cell";

// TODO: credit https://en.wikipedia.org/wiki/Breadth-first_search
// TODO: account for larger token size e.g. 2x2
export function shortestPath(cells: HighlightedCell[]): HighlightedCell[] {
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
