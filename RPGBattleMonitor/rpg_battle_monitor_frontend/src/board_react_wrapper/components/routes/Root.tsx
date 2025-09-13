import { Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { GAMELIST_ROUTE_PATH } from "../../routes/game_list";
import { BOARD_ROUTE_PATH } from "../../routes/board";

export const RootRoute = () => {
    const matches = useMatchRoute();

    const defaultRoutes = () => {
        return (
            <>
                <Link to="/">Home</Link>
                <Link to={GAMELIST_ROUTE_PATH}>Game list</Link>
                <Link to={BOARD_ROUTE_PATH}>Board</Link>
                <Outlet />
                <TanStackRouterDevtools />
            </>
        );
    };

    const boardRoute = () => {
        return (
            <>
                <Outlet />
                <TanStackRouterDevtools />
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
