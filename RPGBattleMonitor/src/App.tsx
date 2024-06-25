import { Sprite } from "pixi.js";
import "./App.css";
import { useApp, useViewport } from "./hooks/useCanvasContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { Slider } from "antd";

const style: React.CSSProperties = {
    display: "inline-block",
    height: 300,
    marginLeft: 70,
};

function App() {
    const viewport = useViewport();
    const box: Sprite = viewport.getChildAt(0);

    const [height, setHeight] = useState(box.height);
    const [width, setWidth] = useState(box.width);
    const [selection, setSelection] = useState<string | null>(null);

    useMemo(() => {
        document.addEventListener("testevent", (e) => {
            setSelection(e.detail);
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (width > 100) {
                setWidth(10);
            } else {
                setWidth(width + 1);
            }
        }, 10);
        box.height = height;
        box.width = width;

        return () => {
            clearTimeout(interval);
        };
    }, [height, width]);

    return (
        <>
            <Slider min={10} max={500} value={width} onChange={setWidth} />
            <div style={style}>
                <Slider
                    reverse
                    vertical
                    min={10}
                    max={500}
                    value={height}
                    onChange={setHeight}
                />
            </div>
            <div> {`${selection}`} </div>
        </>
    );
}

export default App;
