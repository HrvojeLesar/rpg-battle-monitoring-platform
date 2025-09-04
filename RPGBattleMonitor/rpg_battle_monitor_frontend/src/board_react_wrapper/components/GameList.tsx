import { useMutation, useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../requests/query_keys";
import { createGame, fetchGames } from "../requests/games";
import { queryClient } from "../../App";
import { Button } from "antd";

export const GameList = () => {
    const gameList = useQuery({
        queryKey: [QueryKeys.Games],
        queryFn: () => fetchGames(),
    });

    const createGameMutation = useMutation({
        mutationFn: () => createGame(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Games] });
        },
    });

    if (gameList.isPending) {
        return <div>Loading...</div>;
    }

    if (gameList.isError) {
        console.error(gameList.error);

        return <div>{gameList.error.message}</div>;
    }

    return (
        <>
            <div>
                {gameList.data.map((game, idx) => {
                    return <div key={idx}>{game.name}</div>;
                })}
            </div>
            <Button onClick={() => createGameMutation.mutate()}>
                Create Game
            </Button>
        </>
    );
};
