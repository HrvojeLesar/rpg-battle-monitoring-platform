import { IContainerMixin } from "../mixins/container_mixin";

type RegisteredEvent = {
    event: string;
    handler: () => void;
};

export class EventStore {
    protected eventMap = new Map<IContainerMixin, RegisteredEvent[]>();

    public register(
        container: IContainerMixin,
        event: string,
        handler: () => void,
    ): EventStore {
        const events = this.eventMap.get(container) || [];
        events.push({ event, handler });
        this.eventMap.set(container, events);

        return this;
    }

    public unregister(container: IContainerMixin, event: string): EventStore {
        const events = this.eventMap.get(container) || [];
        events.filter((e) => e.event === event).forEach((e) => e.handler());

        this.eventMap.set(
            container,
            events.filter((e) => e.event !== event),
        );

        return this;
    }

    public clear(container: IContainerMixin): EventStore {
        const events = this.eventMap.get(container) || [];
        events.forEach((e) => e.handler());

        this.eventMap.delete(container);

        return this;
    }
}
