import { turnOrderAtoms } from "@/rpg_impl/stores/turn_order_store";
import { Box, Checkbox, Flex } from "@mantine/core";
import { useAtomValue } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import { TurnOrder as RPGTurnOrder, TurnOrderEntry } from "../turn/turn_order";
import { queueEntityUpdate } from "@/websocket/websocket";
import { useDebouncedCallback } from "@mantine/hooks";

export const TurnOrder = () => {
    const { turnOrder } = useAtomValue(turnOrderAtoms.currentTurnOrder);

    const turnOrderState = () => {
        if (turnOrder === undefined) {
            return "No turn order";
        }

        return turnOrder.state;
    };

    const displayTokens = () => {
        if (turnOrder === undefined) {
            return <></>;
        }

        return (
            <Flex direction="column">
                {turnOrder.tokens.map((entry, idx) => {
                    const uid = entry.token.getUId();
                    const isOnTurn = turnOrder.tokenIdxOnTurn === idx;
                    return (
                        <TokenTurnEntry key={uid}>
                            <Box bg={isOnTurn ? "green" : undefined}>
                                Token {uid} {entry.initiative}
                            </Box>
                            <TokenTurnEntry.Surprised
                                turnOrder={turnOrder}
                                entry={entry}
                            />
                        </TokenTurnEntry>
                    );
                })}
            </Flex>
        );
    };

    return (
        <Flex direction="column">
            <div>{turnOrderState()}</div>
            {displayTokens()}
        </Flex>
    );
};

export type TokenTurnEntryProps = {
    children?: ReactNode;
};

export type TokenTurnEntrySurprisedProps = {
    turnOrder: RPGTurnOrder;
    entry: TurnOrderEntry;
};

export const TokenTurnEntry = ({ children }: TokenTurnEntryProps) => {
    return <Flex>{children}</Flex>;
};

const Surprised = ({ entry, turnOrder }: TokenTurnEntrySurprisedProps) => {
    const [surprised, setSurprised] = useState(entry.surprised);

    const updateTurnOrder = useDebouncedCallback(() => {
        queueEntityUpdate(() => {
            return turnOrder;
        });
    }, 200);

    useEffect(() => {
        setSurprised(entry.surprised);
    }, [entry.surprised]);

    return (
        <Checkbox
            label="Surprised"
            checked={surprised}
            disabled={false}
            onChange={(event) => {
                const value = event.currentTarget.checked;
                entry.surprised = value;
                setSurprised(value);
                updateTurnOrder();
            }}
        />
    );
};

TokenTurnEntry.Surprised = Surprised;
