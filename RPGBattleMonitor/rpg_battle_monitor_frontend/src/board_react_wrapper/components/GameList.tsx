import { useMutation, useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../requests/query_keys";
import { createGame, fetchGames } from "../requests/games";
import { queryClient } from "../../App";
import { useNavigate } from "@tanstack/react-router";
import { BOARD_ROUTE_PATH } from "../routes/board";
import { useSetAtom } from "jotai";
import { gameStore } from "../stores/game_store";
import { Button, Flex } from "@mantine/core";

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

    const navigate = useNavigate({});

    const setGameId = useSetAtom(gameStore.setGameId);

    if (gameList.isPending) {
        return <div>Loading...</div>;
    }

    if (gameList.isError) {
        console.error(gameList.error);

        return <div>{gameList.error.message}</div>;
    }

    return (
        <Flex gap="xs" direction="column">
            <Button onClick={() => createGameMutation.mutate()}>
                Create Game
            </Button>
            <div>
                <Flex gap="xs" direction="column">
                    {gameList.data.map((game, idx) => {
                        return (
                            <Button
                                key={idx}
                                onClick={() => {
                                    setGameId(game.id);
                                    navigate({ to: BOARD_ROUTE_PATH });
                                }}
                            >
                                {game.name} - {game.id}
                            </Button>
                        );
                    })}
                </Flex>
            </div>
        </Flex>
    );
};
