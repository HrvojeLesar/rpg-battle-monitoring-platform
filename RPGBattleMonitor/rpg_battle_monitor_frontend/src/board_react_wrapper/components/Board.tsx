import { init } from "../../board_core/board";
import { PixiApplication } from "../../components/PixiApplication";

export const Board = () => {
    return (
        <>
            <PixiApplication applicationInitCallback={init} resizeTo={window} />
        </>
    );
};
