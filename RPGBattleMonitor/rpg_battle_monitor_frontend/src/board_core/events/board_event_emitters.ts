import EventEmitter from "eventemitter3";
import { EventEmitterTypes } from "./event_names";

export class BoardEventEmitter extends EventEmitter<EventEmitterTypes> {
    public constructor() {
        super();
    }
}
