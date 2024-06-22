import { Sprite } from "pixi.js";
import "./App.css";
import { useViewport } from "./hooks/useCanvasContext";
import { useEffect, useState } from "react";
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
    useEffect(() => {
        box.height = height;
        box.width = width;
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
        </>
    );
}

export default App;
