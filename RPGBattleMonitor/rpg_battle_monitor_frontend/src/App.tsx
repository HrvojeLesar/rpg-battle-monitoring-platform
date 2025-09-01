import "./App.css";
import { PixiApplication } from "./components/PixiApplication";
import { init } from "./board_core/board";
import React, { useRef } from "react";
import { Provider } from "react-redux";
import "pixi.js/math-extras";
import { store } from "./board_react_wrapper/stores/state_store";

function App() {
    const div = useRef<HTMLDivElement | null>(null);

    return (
        <React.StrictMode>
            <Provider store={store}>
                <div style={{ width: "100%", height: "100%" }} ref={div}></div>
                <PixiApplication
                    applicationInitCallback={init}
                    resizeTo={div}
                />
            </Provider>
        </React.StrictMode>
    );
}

export default App;
