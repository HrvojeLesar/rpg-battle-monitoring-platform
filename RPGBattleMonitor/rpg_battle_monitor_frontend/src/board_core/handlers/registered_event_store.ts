import { ContainerExtension } from "../extensions/container_extension";

type RegisteredEvent = {
    event: string;
    handler: () => void;
};

export class EventStore {
    protected eventMap = new Map<ContainerExtension, RegisteredEvent[]>();

    public register(
        container: ContainerExtension,
        event: string,
        handler: () => void,
    ): EventStore {
        const events = this.eventMap.get(container) || [];
        events.push({ event, handler });
        this.eventMap.set(container, events);

        return this;
    }

    public unregister(container: ContainerExtension, event: string): EventStore {
        const events = this.eventMap.get(container) || [];
        events.filter((e) => e.event === event).forEach((e) => e.handler());

        this.eventMap.set(
            container,
            events.filter((e) => e.event !== event),
        );

        return this;
    }

    public clear(container: ContainerExtension): EventStore {
        const events = this.eventMap.get(container) || [];
        events.forEach((e) => e.handler());

        this.eventMap.delete(container);

        return this;
    }
}
