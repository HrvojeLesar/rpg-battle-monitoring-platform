import { createContext, ReactNode, useEffect, useState } from "react";
import {
    DestoryApplicationEvent,
    InitApplicationEvent,
    ReactPixiJsBridgeEventEmitter,
} from "../types/event_emitter";
import { ApplicationManager } from "../canvas/managers/application_manager";

type Props = {
    children?: ReactNode;
    eventEmitter?: ReactPixiJsBridgeEventEmitter;
};

export type ReactPixiJsBridgeContext = {
    eventEmitter: ReactPixiJsBridgeEventEmitter;
    applicationManager?: ApplicationManager;
    isReady: boolean;
    instanceNumber: number;
};

export const ReactPixiJsBridgeContext = createContext<
    ReactPixiJsBridgeContext | undefined
>(undefined);

let oldContext = undefined;
export const ReactPixiJsBridgeContextProvider = (props: Props) => {
    const [eventEmitter, _setEventEmitter] = useState<
        ReactPixiJsBridgeEventEmitter | undefined
    >(props.eventEmitter);

    const [context, setContext] = useState<
        ReactPixiJsBridgeContext | undefined
    >(undefined);

    useEffect(() => {
        if (eventEmitter === undefined) {
            return;
        }

        const handleContextEvent = (
            event: InitApplicationEvent | DestoryApplicationEvent,
            isReady: boolean,
        ) => {
            setContext((old) => {
                if (old && old.instanceNumber > event.instanceNumber) {
                    oldContext = old;
                    return {
                        ...old,
                    };
                }

                return {
                    applicationManager: event.app,
                    eventEmitter: eventEmitter,
                    isReady: isReady,
                    instanceNumber: event.instanceNumber,
                };
            });
        };

        eventEmitter.on("initApplication", (event) => {
            handleContextEvent(event, true);
        });

        eventEmitter.on("destroyApplication", (event) => {
            handleContextEvent(event, false);
        });

        return () => {
            eventEmitter.off("initApplication");
            eventEmitter.off("destroyApplication");
        };
    }, [eventEmitter]);

    return (
        <ReactPixiJsBridgeContext.Provider value={context}>
            {props.children}
        </ReactPixiJsBridgeContext.Provider>
    );
};
