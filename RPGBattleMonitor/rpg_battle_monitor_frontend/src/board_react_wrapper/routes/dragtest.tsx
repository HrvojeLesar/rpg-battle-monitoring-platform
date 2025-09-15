import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { WindowOverlay } from "../components/floating_windows/Window";

export const DRAG_TEST = "/drag-test";

export const DragTestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: DRAG_TEST,
    component: WindowOverlay,
});
