import { ContainerExtension } from "@/board_core/extensions/container_extension";
import { GridCell } from "@/board_core/grid/cell";
import { DragHandler } from "@/board_core/handlers/drag_handler";
import { EventStore } from "@/board_core/handlers/registered_event_store";
import { SelectHandler } from "@/board_core/handlers/select_handler";
import { Layer } from "@/board_core/layers/layers";
import { Scene } from "@/board_core/scene";
import { Container, FederatedPointerEvent, Point } from "pixi.js";
import { Arrow } from "../graphics/arrow";

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
        event: FederatedPointerEvent,
        offset: Point,
        container: ContainerExtension,
    ) {
        super.onGlobalPointerMove(event, offset, container);

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
            });
        });
    }

    protected override onPointerDown(event: FederatedPointerEvent) {
        super.onPointerDown(event);

        this.selectHandler.selections.forEach((selection) => {
            const cell = selection.getGridCellPosition();
            this.startPositions.push(cell);
            const cellSize = this.scene.grid.cellSize;
            console.log(cell, cell.x * cellSize);
            const startPoint = new Point(
                cell.x * cellSize + cellSize / 2,
                cell.y * cellSize + cellSize / 2,
            );
            this.dragLayer.container.addChild(
                new Arrow({
                    from: startPoint,
                    to: startPoint,
                    forContainer: selection,
                }),
            );
        });
    }

    protected override onPointerUp(): void {
        super.onPointerUp();

        this.dragLayer.container.children.forEach((child) => {
            child.destroy();
        });
    }
}
