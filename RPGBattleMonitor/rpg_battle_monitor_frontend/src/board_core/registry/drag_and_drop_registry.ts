export type DradAndDropHandler = (event: DragEvent, data: string) => void;

class DragAndDropRegistry {
    protected handlers: Map<string, DradAndDropHandler> = new Map();

    public registerHandler(key: string, handler: DradAndDropHandler) {
        this.handlers.set(key, handler);
    }

    public handle(data: Maybe<string>, event: DragEvent) {
        if (data === undefined) {
            return;
        }

        const split = data.split(":");
        const key = split.at(0);
        if (key === undefined) {
            return;
        }

        const dataString = split.slice(1).join(":");

        const handler = this.handlers.get(key);
        if (handler) {
            handler(event, dataString);
        }
    }

    public emit(event: DragEvent, key: string, data: string) {
        event.dataTransfer?.setData("text/plain", `${key}:${data}`);
    }
}

export const GDragAndDropRegistry = new DragAndDropRegistry();
