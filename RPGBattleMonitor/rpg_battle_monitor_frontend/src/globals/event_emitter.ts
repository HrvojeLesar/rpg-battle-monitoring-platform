import { EventEmitter } from "pixi.js";

// TODO: remove this or add logic for fetching event
// emmiter for each separate pixi.js application
// or uniqly identify events dispatched by different
// pixi.js application
export const EE = new EventEmitter();
