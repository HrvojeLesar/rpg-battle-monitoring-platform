import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { PixiApplication } from "./components/PixiApplication";
import { init } from "./canvas/init";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");
    const div = useRef<HTMLDivElement | null>(null);
    const div2 = useRef<HTMLDivElement | null>(null);
    const [choosenDiv, setChoosenDiv] = useState(div);

    return (
        <>
            <div style={{ width: "100%", height: "100%" }} ref={div}></div>
            <div style={{ width: "100px", height: "100px" }} ref={div2}></div>
            <PixiApplication
                applicationInitCallback={init}
                resizeTo={choosenDiv}
            />
            <button
                onClick={() => {
                    setChoosenDiv((old) => {
                        return old == div ? div2 : div;
                    });
                }}
            >
                Test
            </button>
            <main className="container">
                <h1>Welcome to Tauri + React</h1>

                <div className="row">
                    <a href="https://vitejs.dev" target="_blank">
                        <img
                            src="/vite.svg"
                            className="logo vite"
                            alt="Vite logo"
                        />
                    </a>
                    <a href="https://tauri.app" target="_blank">
                        <img
                            src="/tauri.svg"
                            className="logo tauri"
                            alt="Tauri logo"
                        />
                    </a>
                    <a href="https://reactjs.org" target="_blank">
                        <img
                            src={reactLogo}
                            className="logo react"
                            alt="React logo"
                        />
                    </a>
                </div>
                <p>Click on the Tauri, Vite, and React logos to learn more.</p>

                <form
                    className="row"
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <input
                        id="greet-input"
                        onChange={(e) => setName(e.currentTarget.value)}
                        placeholder="Enter a name..."
                    />
                    <button type="submit">Greet</button>
                </form>
                <p>{name}</p>
            </main>
        </>
    );
}

export default App;
