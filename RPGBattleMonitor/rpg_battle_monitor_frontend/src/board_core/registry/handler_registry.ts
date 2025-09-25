import { DragHandler } from "../handlers/drag_handler";
import { SelectHandler } from "../handlers/select_handler";

export type Handlers = {
    select: typeof SelectHandler;
    drag: typeof DragHandler;
};

class HandlerRegistry {
    protected _handlerClasses: Handlers;

    public constructor() {
        this._handlerClasses = {
            select: SelectHandler,
            drag: DragHandler,
        };
    }

    public get handler(): Handlers {
        return this._handlerClasses;
    }

    public overrideHandler(handler: keyof Handlers, handlerClass: any) {
        this._handlerClasses[handler] = handlerClass;
    }
}

export const GHandlerRegistry = new HandlerRegistry();
