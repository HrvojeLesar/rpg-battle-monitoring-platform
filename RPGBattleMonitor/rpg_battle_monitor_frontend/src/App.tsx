import "./App.css";
import React from "react";
import { Provider } from "react-redux";
import "pixi.js/math-extras";
import { store } from "./board_react_wrapper/stores/state_store";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./board_react_wrapper/routes/root";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient();

function App() {
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <RouterProvider router={router} />
                </Provider>
            </QueryClientProvider>
        </React.StrictMode>
    );
}

export default App;
