import { createRootRoute, createRouter } from "@tanstack/react-router";
import { HomeRoute } from "./home";
import { RootRoute } from "../components/routes/Root";
import { GameListRoute } from "./game_list";
import { BoardRoute } from "./board";

export const rootRoute = createRootRoute({
    component: RootRoute,
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
