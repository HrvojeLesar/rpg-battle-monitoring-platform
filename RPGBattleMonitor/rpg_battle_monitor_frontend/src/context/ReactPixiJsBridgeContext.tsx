import { createContext, ReactNode } from "react";
import { ReactPixiJsBridgeEventEmitter } from "../types/event_emitter";
import EventEmitter from "eventemitter3";

export interface ReactPixiJsBridgeContext {
    eventEmitter: ReactPixiJsBridgeEventEmitter;
}

type Props = {
    children?: ReactNode;
};

export const ReactPixiJsBridgeContext =
    createContext<ReactPixiJsBridgeEventEmitter>(new EventEmitter());

export const ReactPixiJsBridgeContextProvider = (props: Props) => {
    return (
        <ReactPixiJsBridgeContext.Provider value={new EventEmitter()}>
            {props.children}
        </ReactPixiJsBridgeContext.Provider>
    );
};
