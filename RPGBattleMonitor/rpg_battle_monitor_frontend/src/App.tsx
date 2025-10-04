import "./App.css";
import React from "react";
import "pixi.js/math-extras";
import { GAtomStore } from "./board_react_wrapper/stores/state_store";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./board_react_wrapper/routes/root";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

export const queryClient = new QueryClient();

function App() {
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <Provider store={GAtomStore}>
                    <MantineProvider defaultColorScheme="auto">
                        <ModalsProvider>
                            <Notifications />
                            <RouterProvider router={router} />
                        </ModalsProvider>
                    </MantineProvider>
                </Provider>
            </QueryClientProvider>
        </React.StrictMode>
    );
}

export default App;
