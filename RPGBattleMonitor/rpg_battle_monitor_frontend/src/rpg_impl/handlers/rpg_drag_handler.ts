import { DragHandler } from "@/board_core/handlers/drag_handler";
import { EventStore } from "@/board_core/handlers/registered_event_store";
import { SelectHandler } from "@/board_core/handlers/select_handler";
import { Scene } from "@/board_core/scene";

export class RpgDragHandler extends DragHandler {
    public constructor(
        scene: Scene,
        selectHandler: SelectHandler,
        eventStore: EventStore,
    ) {
        super(scene, selectHandler, eventStore);

        console.log("rpg drag handler");
    }
}
