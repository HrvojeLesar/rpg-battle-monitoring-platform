import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";

export const HOME_ROUTE_PATH = "/";

export const Home = () => {
    <></>;
};

export const HomeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: HOME_ROUTE_PATH,
    component: Home,
});
