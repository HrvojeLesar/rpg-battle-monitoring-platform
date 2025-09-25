import { GBoard } from "../board";
import { DeleteAction, IMessagable } from "../interfaces/messagable";

export type Callback = (
    entity: IMessagable,
    deleteAction: DeleteAction,
) => void;

export type RemoveAndFlushEntitiesOptions = {
    beforeFlush?: Callback;
    afterFlush?: Callback;
    beforeCleanup?: Callback;
    afterCleanup?: Callback;
};

export const removeAndFlushEntities = (
    entity: IMessagable,
    options?: RemoveAndFlushEntitiesOptions,
) => {
    const deleteAction = GBoard.entityRegistry.entities.remove(entity);

    for (const entity of deleteAction.acc) {
        GBoard.websocket.queue(entity, "deleteQueue");
    }

    options?.beforeFlush?.(entity, deleteAction);

    GBoard.websocket.flush();

    options?.afterFlush?.(entity, deleteAction);

    options?.beforeCleanup?.(entity, deleteAction);

    deleteAction.cleanupCallbacks.forEach((cb) => cb());

    options?.afterCleanup?.(entity, deleteAction);
};
