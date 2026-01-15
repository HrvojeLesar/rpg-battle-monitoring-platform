import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { getBaseUrl } from "../utils/utils";
import { Input, Container, Button, Flex } from "@mantine/core";
import { useState } from "react";
import { useSetAtom } from "jotai";
import { connectionStore } from "../stores/connection_store";

export const HOME_ROUTE_PATH = "/";

export const Home = () => {
    const [baseUrl, setBaseUrl] = useState(getBaseUrl());

    const setBaseUrlAtom = useSetAtom(connectionStore.setConnectionInfo);

    return (
        <Container>
            <Flex direction="column" gap="xs">
                <Input.Wrapper
                    label="Server base url"
                    description={`Sets the base url of the server, set value without protocol. Use ${import.meta.env.VITE_BASE_URL} instead of http://${import.meta.env.VITE_BASE_URL}`}
                >
                    <Input
                        placeholder="Current server base url"
                        value={baseUrl}
                        onChange={(e) => {
                            setBaseUrl(e.target.value);
                        }}
                    />
                </Input.Wrapper>
                <Button onClick={() => setBaseUrlAtom({ baseUrl })}>
                    Set base url
                </Button>
            </Flex>
        </Container>
    );
};

export const HomeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: HOME_ROUTE_PATH,
    component: Home,
});
