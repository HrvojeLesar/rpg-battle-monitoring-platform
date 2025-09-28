import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { Board } from "../components/Board";

export const BOARD_ROUTE_PATH = "/game/$gameId";

export const BoardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: BOARD_ROUTE_PATH,
    component: Board,
});
