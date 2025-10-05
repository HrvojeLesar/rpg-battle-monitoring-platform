import { turnOrderAtoms } from "@/rpg_impl/stores/turn_order_store";
import {
    Box,
    Button,
    Checkbox,
    Fieldset,
    Flex,
    Stack,
    Text,
} from "@mantine/core";
import { useAtomValue } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import { TurnOrder as RPGTurnOrder, TurnOrderEntry } from "../turn/turn_order";
import { queueEntityUpdate } from "@/websocket/websocket";
import { useDebouncedCallback } from "@mantine/hooks";
import { Maul } from "../actions/weapons/maul";

export const TurnOrder = () => {
    const { turnOrder } = useAtomValue(turnOrderAtoms.currentTurnOrder);

    const turnOrderState = () => {
        if (turnOrder === undefined) {
            return "No turn order";
        }

        return turnOrder.state;
    };

    const combatButtons = () => {
        if (turnOrder === undefined) {
            return <></>;
        }

        const isInCombat = turnOrder.isInCombat();

        return (
            <>
                {!isInCombat && (
                    <Button
                        onClick={() => {
                            turnOrder.startCombat();
                        }}
                    >
                        Start combat
                    </Button>
                )}
                {isInCombat && (
                    <>
                        <Button
                            onClick={() => {
                                turnOrder.stopCombat();
                            }}
                        >
                            End combat
                        </Button>
                        <Button
                            onClick={() => {
                                turnOrder.nextTurn();
                            }}
                        >
                            Next turn
                        </Button>
                    </>
                )}
            </>
        );
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
                                Token {uid} {entry.initiative} {entry.speed}
                            </Box>
                            <TokenTurnEntry.Surprised
                                turnOrder={turnOrder}
                                entry={entry}
                            />
                        </TokenTurnEntry>
                    );
                })}
                <Fieldset legend="Actions">
                    <Stack>
                        <Text>Todo: List tokens actions and group them</Text>
                        {combatButtons()}
                        <Button
                            onClick={() => {
                                // TODO: emit message that other clients can handle and sync state
                                const action = new Maul();
                                const onTurn = turnOrder.getTokenOnTurn();
                                if (onTurn === undefined) {
                                    return;
                                }

                                turnOrder.scene.targetSelectionHandler.doAction(
                                    onTurn.token,
                                    action,
                                );
                            }}
                        >
                            Melee attack
                        </Button>
                        <Button
                            onClick={() => {
                                turnOrder.scene.targetSelectionHandler.cancelAction();
                            }}
                        >
                            Cancel attack
                        </Button>
                    </Stack>
                </Fieldset>
            </Flex>
        );
    };

    return (
        <Stack gap="xs" pb="xs" justify="center" align="stretch">
            {turnOrderState()}
            {displayTokens()}
        </Stack>
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
