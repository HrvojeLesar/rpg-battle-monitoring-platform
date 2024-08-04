import { ObservablePoint, Sprite } from "pixi.js";
import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Input, Slider } from "antd";
import { EE } from "./events/eventEmitter";
import { TestEvent } from "./events/events";
import { createSocket } from "./globals";
import { Socket } from "socket.io-client";

const style: React.CSSProperties = {
    display: "inline-block",
    height: 300,
    marginLeft: 70,
};

function App() {
    const [selection, setSelection] = useState<Sprite | undefined>(undefined);
    const [height, setHeight] = useState(selection?.height ?? 10);
    const [width, setWidth] = useState(selection?.width ?? 10);
    const [roomName, setRoomName] = useState<string | undefined>(undefined);
    const [SOCKET, setSocket] = useState<Socket | undefined>(undefined);

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
        console.log("BRUH");
        EE.on("pos", (e: ObservablePoint) => {
            if (SOCKET) {
                SOCKET.emit("pos", { x: e.x, y: e.y });
            }
        });

        if (SOCKET) {
            SOCKET.on("changepos", (data: any) => {
                EE.emit("changepos", JSON.parse(data));
            });
        }

        return () => {
            EE.off("pos");
            if (SOCKET) {
                SOCKET.off("changepos");
            }
        };
    }, [SOCKET]);

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
            <Input
                placeholder="Room name"
                onChange={(e) => {
                    setRoomName(e.target.value);
                }}
            />
            <Button
                onClick={() => {
                    if (SOCKET) {
                        SOCKET.disconnect();
                        setSocket(undefined);
                    } else {
                        setSocket(createSocket(roomName ?? ""));
                    }
                }}
            >
                {SOCKET === undefined ? "Connect" : "Disconnect"}
            </Button>
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
