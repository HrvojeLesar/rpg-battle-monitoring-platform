import { ObservablePoint, Sprite } from "pixi.js";
import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { Checkbox, Slider } from "antd";
import { EE } from "./events/eventEmitter";
import { TestEvent } from "./events/events";
import { SOCKET } from "./globals";

const style: React.CSSProperties = {
    display: "inline-block",
    height: 300,
    marginLeft: 70,
};

function App() {
    const [selection, setSelection] = useState<Sprite | null>(null);
    const [height, setHeight] = useState(selection?.height ?? 10);
    const [width, setWidth] = useState(selection?.width ?? 10);
    const [doesSend, setDoesSend] = useState(false);
    const [doesReceive, setDoesReceive] = useState(false);

    useMemo(() => {
        EE.on("test", (e: TestEvent) => {
            setSelection((_old) => {
                setWidth(e.width);
                setHeight(e.height);
                return e;
            });
        });
    }, []);

    useEffect(() => {
        EE.on("pos", (e: ObservablePoint) => {
            if (doesSend) {
                SOCKET.emit("pos", JSON.stringify({ x: e.x, y: e.y }));
            }
        });

        SOCKET.on("changepos", (data: any) => {
            if (doesReceive) {
                EE.emit("changepos", JSON.parse(data));
            }
        });

        return () => {
            EE.off("pos");
            SOCKET.off("changepos");
        };
    }, [doesSend, doesReceive]);

    useEffect(() => {
        if (!selection) {
            return;
        }
        // const interval = setInterval(() => {
        //     if (width > 100) {
        //         setWidth(10);
        //     } else {
        //         setWidth(width + 1);
        //     }
        // }, 1000);
        selection.height = height;
        selection.width = width;

        // return () => {
        //     clearTimeout(interval);
        // };
    }, [height, width, selection]);

    return (
        <>
            <Checkbox
                checked={doesSend}
                onChange={() => {
                    setDoesSend((old) => !old);
                }}
            >
                Does send
            </Checkbox>
            <Checkbox
                checked={doesReceive}
                onChange={() => {
                    setDoesReceive((old) => !old);
                }}
            >
                Does Receive
            </Checkbox>
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
            <div> {`${selection?.label}`} </div>
        </>
    );
}

export default App;
