import {
    createRootRoute,
    createRouter,
    Link,
    Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { GAMELIST_ROUTE_PATH, GameListRoute } from "./game_list";
import { BOARD_ROUTE_PATH, BoardRoute } from "./board";
import { HomeRoute } from "./home";

export const rootRoute = createRootRoute({
    component: () => (
        <>
            <Link to="/">Home</Link>
            <Link to={GAMELIST_ROUTE_PATH}>Game list</Link>
            <Link to={BOARD_ROUTE_PATH}>Board</Link>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
});

export const routeTree = rootRoute.addChildren([
    HomeRoute,
    GameListRoute,
    BoardRoute,
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
    interface RegisterRouter {
        router: typeof router;
    }
}
