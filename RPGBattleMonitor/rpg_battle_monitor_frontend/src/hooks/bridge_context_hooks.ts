import { useContext } from "react";
import { ReactPixiJsBridgeContext } from "../context/ReactPixiJsBridgeContext";
import { ApplicationManager } from "../canvas/managers/application_manager";
import { ReactPixiJsBridgeEventEmitter } from "../types/event_emitter";

export const useApplicationManager: () => ApplicationManager = () => {
    const context = useContext(ReactPixiJsBridgeContext);
    if (context === undefined || context.applicationManager === undefined) {
        throw new Error("ApplicationManager is not initialized");
    }

    return context.applicationManager;
};

export const useEventEmitter: () => ReactPixiJsBridgeEventEmitter = () => {
    const context = useContext(ReactPixiJsBridgeContext);
    if (context === undefined) {
        throw new Error("Context is not initialized");
    }

    return context.eventEmitter;
};
