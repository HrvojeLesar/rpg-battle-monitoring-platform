import { useMutation, useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../requests/query_keys";
import { createGame, fetchGames } from "../requests/games";
import { queryClient } from "../../App";
import { useNavigate } from "@tanstack/react-router";
import { BOARD_ROUTE_PATH } from "../routes/board";
import { Button, Container, Divider, Flex, Select } from "@mantine/core";
import { useState } from "react";

const createUsersArray = () => {
    return Array.from({ length: 11 }, (_, index) => {
        if (index === 0) {
            return {
                value: "dm",
                label: "DM",
            };
        }

        return {
            value: String(index),
            label: `Player ${index}`,
        };
    });
};

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
        <Container>
            <Flex gap="xs" direction="column">
                <Button onClick={() => createGameMutation.mutate()}>
                    Create Game
                </Button>
                <Divider />
                <div>
                    <Flex gap="xs" direction="column">
                        {gameList.data.map((game, idx) => {
                            return <GameItem key={idx} game={game} />;
                        })}
                    </Flex>
                </div>
            </Flex>
        </Container>
    );
};

const GameItem = ({ game }: { game: Game }) => {
    const navigate = useNavigate({});

    const [selectedValue, setSelectedValue] = useState<string | null>("dm");

    return (
        <Flex gap="xs">
            <Button
                style={{ flexGrow: 2 }}
                onClick={() => {
                    navigate({
                        to: BOARD_ROUTE_PATH,
                        params: {
                            gameId: String(game.id),
                            playerId: selectedValue ?? "dm",
                        },
                    });
                }}
            >
                Join {game.name} - {game.id} as:
            </Button>
            <Select
                style={{ flexGrow: 1 }}
                value={selectedValue}
                onChange={setSelectedValue}
                data={createUsersArray()}
            />
        </Flex>
    );
};
