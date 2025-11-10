import { init } from "../../board_core/board";
import { PixiApplication } from "../../components/PixiApplication";
import { BoardRoute } from "../routes/board";

export const Board = () => {
    const { gameId, playerId } = BoardRoute.useParams();

    const player = playerId?.length === 0 ? "dm" : playerId;

    return (
        <>
            <PixiApplication
                applicationInitCallback={init}
                resizeTo={window}
                gameId={Number(gameId)}
                playerId={player}
            />
        </>
    );
};
