import { init } from "../../board_core/board";
import { PixiApplication } from "../../components/PixiApplication";
import { BoardRoute } from "../routes/board";

export const Board = () => {
    const { gameId } = BoardRoute.useParams();

    return (
        <>
            <PixiApplication
                applicationInitCallback={init}
                resizeTo={window}
                gameId={Number(gameId)}
            />
        </>
    );
};
