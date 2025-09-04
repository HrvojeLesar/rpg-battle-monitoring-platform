import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { GameList } from "../components/GameList";

export const GAMELIST_ROUTE_PATH = "/game-list";

export const GameListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: GAMELIST_ROUTE_PATH,
    component: GameList,
});
