import { Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { GAMELIST_ROUTE_PATH } from "../../routes/game_list";
import { BOARD_ROUTE_PATH } from "../../routes/board";
import { Container, Flex } from "@mantine/core";

export const RootRoute = () => {
    const matches = useMatchRoute();

    const defaultRoutes = () => {
        return (
            <Flex direction="column">
                <Container>
                    <Flex gap="xs">
                        <Link to="/">Home</Link>
                        <Link to={GAMELIST_ROUTE_PATH}>Game list</Link>
                    </Flex>
                </Container>
                <Outlet />
            </Flex>
        );
    };

    const boardRoute = () => {
        return (
            <>
                <Outlet />
            </>
        );
    };

    const displayRoute = () => {
        if (matches({ to: BOARD_ROUTE_PATH })) {
            return boardRoute();
        } else {
            return defaultRoutes();
        }
    };

    return displayRoute();
};
