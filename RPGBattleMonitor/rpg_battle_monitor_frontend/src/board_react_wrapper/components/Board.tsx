import { useRef } from "react";
import { init } from "../../board_core/board";
import { PixiApplication } from "../../components/PixiApplication";

export const Board = () => {
    const div = useRef<HTMLDivElement | null>(null);

    return (
        <>
            <div style={{ width: "100%", height: "100%" }} ref={div}></div>
            <PixiApplication applicationInitCallback={init} resizeTo={div} />
        </>
    );
};
