import { createRootRoute, createRouter } from "@tanstack/react-router";
import { HomeRoute } from "./home";
import { RootRoute } from "../components/routes/Root";
import { GameListRoute } from "./game_list";
import { BoardRoute } from "./board";
import { DragTestRoute } from "./dragtest";

export const rootRoute = createRootRoute({
    component: RootRoute,
});

export const routeTree = rootRoute.addChildren([
    HomeRoute,
    GameListRoute,
    BoardRoute,
    DragTestRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
