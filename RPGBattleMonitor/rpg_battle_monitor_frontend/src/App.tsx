import "./App.css";
import React from "react";
import "pixi.js/math-extras";
import { GAtomStore } from "./board_react_wrapper/stores/state_store";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./board_react_wrapper/routes/root";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { initEventListeners } from "./board_react_wrapper/event_listeners/board_init_event_listener";

export const queryClient = new QueryClient();

initEventListeners();

import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";

function App() {
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <Provider store={GAtomStore}>
                    <MantineProvider defaultColorScheme="auto">
                        <RouterProvider router={router} />
                    </MantineProvider>
                </Provider>
            </QueryClientProvider>
        </React.StrictMode>
    );
}

export default App;
