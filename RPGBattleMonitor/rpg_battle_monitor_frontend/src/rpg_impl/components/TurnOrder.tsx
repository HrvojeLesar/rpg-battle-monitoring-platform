import { turnOrderAtoms } from "@/rpg_impl/stores/turn_order_store";
import { Box, Flex } from "@mantine/core";
import { useAtomValue } from "jotai";

export const TurnOrder = () => {
    const { turnOrder } = useAtomValue(turnOrderAtoms.currentTurnOrder);

    const displayTokens = () => {
        if (turnOrder === undefined) {
            return <></>;
        }

        return (
            <Flex direction="column">
                {turnOrder.tokens.map((entry) => {
                    const uid = entry.token.getUId();
                    return (
                        <Box bg="red" key={uid}>
                            {uid}
                        </Box>
                    );
                })}
            </Flex>
        );
    };

    return (
        <Flex direction="column">
            <div>{turnOrder?.getUId() ?? "No turn order"}</div>
            {displayTokens()}
        </Flex>
    );
};
