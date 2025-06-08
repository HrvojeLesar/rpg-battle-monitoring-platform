import { useRef } from "react";
import "./App.css";
import { PixiApplication } from "./components/PixiApplication";
import { init } from "./canvas/init";

function App() {
    const div = useRef<HTMLDivElement | null>(null);

    return (
        <>
            <div style={{ width: "100%", height: "100%" }} ref={div}></div>
            <PixiApplication applicationInitCallback={init} resizeTo={div} />
        </>
    );
}

export default App;
