import { turnOrderAtoms } from "@/rpg_impl/stores/turn_order_store";
import {
    Button,
    Checkbox,
    Fieldset,
    Flex,
    Stack,
    Text,
    Image,
    Paper,
    Group,
    Avatar,
    Radio,
} from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import {
    TurnOrder as RPGTurnOrder,
    TurnOrderEntry,
    TurnOrderState,
} from "../turn/turn_order";
import { queueEntityUpdate } from "@/websocket/websocket";
import { useDebouncedCallback } from "@mantine/hooks";
import { Maul } from "../actions/weapons/maul";
import { DeathSave as DeathSaveAction } from "../actions/death_save";
import { AssetHoverPreviewDefault } from "@/board_react_wrapper/components/assets/AssetHoverPreview";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { defaultImageUrl } from "@/board_react_wrapper/components/interface/Tokens";
import { GTokenWindowRegistry } from "../registry/token_window_registry";
import { TurnOrderFactory } from "../factories/turn_order_factory";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { RpgToken } from "../tokens/rpg_token";
import { RpgScene } from "../scene/scene";
import { IconSwords } from "@tabler/icons-react";
import { DeleteConfirmation } from "@/board_react_wrapper/components/utils/DeleteConfirmation";
import { HealthState } from "../characters_stats/health_state";
import { GEventEmitter } from "@/board_core/board";
import { RpgTokenData } from "../tokens/rpg_token_data";
import { IMessagable } from "@/board_core/interfaces/messagable";
import { windowAtoms } from "@/board_react_wrapper/stores/window_store";
import { openDiceRollWindow } from "./windows/DiceRollWindow";

export const TurnOrderIcon = () => {
    return <IconSwords size={20} />;
};

export const TurnOrder = () => {
    const { turnOrder } = useAtomValue(turnOrderAtoms.currentTurnOrder);
    const refreshTurnOrder = useSetAtom(turnOrderAtoms.currentTurnOrder);
    const currentScene = useAtomValue(sceneAtoms.getCurrentScene);
    const openWindow = useSetAtom(windowAtoms.openWindow);

    useEffect(() => {
        const tryUpdate = (entity: IMessagable) => {
            if (entity instanceof RpgTokenData) {
                const updatedEntity = turnOrder?.tokens.find(
                    (entry) => entry.token.tokenData === entity,
                );
                if (updatedEntity !== undefined) {
                    refreshTurnOrder();
                }
            }
        };
        GEventEmitter.on("entity-updated", tryUpdate);

        return () => {
            GEventEmitter.off("entity-updated", tryUpdate);
        };
    }, [turnOrder, refreshTurnOrder]);

    const combatButtons = () => {
        if (turnOrder === undefined) {
            return <></>;
        }

        const isInCombat = turnOrder.isInCombat();

        return (
            <>
                {isInCombat && (
                    <>
                        <Button
                            onClick={() => {
                                turnOrder.scene.targetSelectionHandler.cancelAction();
                                turnOrder.nextTurn();
                                queueEntityUpdate(() => {
                                    return turnOrder;
                                });
                            }}
                            disabled={
                                turnOrder.getTokenOnTurn()?.token.tokenData
                                    .healthState !== HealthState.Healthy
                            }
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
            return "No turn order";
        }

        const tokens =
            turnOrder.state === TurnOrderState.InCombat
                ? turnOrder.actionableTokens
                : turnOrder.tokens;

        return (
            <Flex direction="column">
                <TokenTurnEntry>
                    <Group gap="xs">
                        <Text>Encounter status:</Text>
                        <Text fw="bold">
                            {turnOrder.state === TurnOrderState.InCombat
                                ? "In combat"
                                : "Out of combat"}
                        </Text>
                    </Group>
                    {tokens.map((entry, idx) => {
                        const uid = entry.token.getUId();
                        const token = entry.token;
                        const isOnTurn = turnOrder.tokenIdxOnTurn === idx;
                        const imageUrl =
                            token.tokenData.image !== undefined
                                ? getUrl(token.tokenData.image)
                                : defaultImageUrl;
                        return (
                            <Flex
                                key={uid}
                                direction="row"
                                gap="xs"
                                align="center"
                            >
                                <Text>{`${idx + 1}.`}</Text>
                                <Flex
                                    p="xs"
                                    gap="xs"
                                    style={{
                                        borderRadius: "5px",
                                        border: isOnTurn
                                            ? "2px solid var(--mantine-color-gray-3)"
                                            : undefined,
                                    }}
                                    wrap="wrap"
                                >
                                    <AssetHoverPreviewDefault
                                        target={<Avatar src={imageUrl} />}
                                        dropdown={
                                            <Image
                                                mah="256px"
                                                maw="256px"
                                                src={imageUrl}
                                            />
                                        }
                                    />
                                    <Paper
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            GTokenWindowRegistry.openWindow(
                                                token.tokenData,
                                            );
                                        }}
                                    >
                                        <Text>{`${token.tokenData.name}`}</Text>
                                    </Paper>
                                    {token.tokenData.healthState !==
                                        HealthState.Unconcious && (
                                        <>
                                            <TokenTurnEntry.Surprised
                                                turnOrder={turnOrder}
                                                entry={entry}
                                            />
                                            <TokenTurnEntry.Initiative
                                                turnOrder={turnOrder}
                                                entry={entry}
                                            />
                                            <TokenTurnEntry.Speed
                                                turnOrder={turnOrder}
                                                entry={entry}
                                            />
                                        </>
                                    )}
                                    {token.tokenData.healthState ===
                                        HealthState.Unconcious && (
                                        <>
                                            <TokenTurnEntry.DeathSave
                                                turnOrder={turnOrder}
                                                entry={entry}
                                            />
                                        </>
                                    )}
                                </Flex>
                            </Flex>
                        );
                    })}
                </TokenTurnEntry>
                <Fieldset legend="Actions">
                    <Stack>
                        <Text>Todo: List tokens actions and group them</Text>
                        <Text>
                            Actions left {turnOrder.getTokenOnTurn()?.action}
                        </Text>
                        <Text>
                            Bonus actions left{" "}
                            {turnOrder.getTokenOnTurn()?.bonusAction}
                        </Text>
                        {combatButtons()}
                        <Button
                            disabled={
                                turnOrder.getTokenOnTurn()?.token.tokenData
                                    .healthState !== HealthState.Healthy ||
                                turnOrder.getTokenOnTurn()?.action === 0
                            }
                            onClick={() => {
                                // TODO: emit message that other clients can handle and sync state
                                const action = new Maul();
                                const onTurnEntry = turnOrder.getTokenOnTurn();
                                if (onTurnEntry === undefined) {
                                    return;
                                }

                                turnOrder.doAction(onTurnEntry.token, action, {
                                    onFinished: () => {
                                        refreshTurnOrder();
                                        queueEntityUpdate(() => {
                                            return turnOrder;
                                        });
                                    },
                                );
                            }}
                        >
                            Maul attack
                        </Button>
                        <Button
                            disabled={
                                turnOrder.getTokenOnTurn()?.token.tokenData
                                    .healthState !== HealthState.Unconcious
                            }
                            onClick={() => {
                                // TODO: emit message that other clients can handle and sync state
                                const action = new DeathSaveAction();
                                const onTurnEntry = turnOrder.getTokenOnTurn();
                                if (onTurnEntry === undefined) {
                                    return;
                                }

                                const token = onTurnEntry.token;
                                action.doAction(token, token, undefined, {
                                    onFinished: () => {
                                        refreshTurnOrder();
                                        queueEntityUpdate(() => {
                                            turnOrder.nextTurn();
                                            return [turnOrder, token.tokenData];
                                        });
                                    },
                                });
                            }}
                        >
                            Roll death save
                        </Button>
                        <Button
                            onClick={() => {
                                turnOrder.scene.targetSelectionHandler.cancelAction();
                            }}
                            disabled={
                                turnOrder.getTokenOnTurn()?.token.tokenData
                                    .healthState !== HealthState.Healthy ||
                                turnOrder.getTokenOnTurn()?.action === 0
                            }
                        >
                            Cancel attack
                        </Button>
                    </Stack>
                </Fieldset>
            </Flex>
        );
    };

    const turnControls = () => {
        return (
            <Fieldset legend="Controls">
                <Flex gap="xs" direction="column" mah="512px">
                    {(turnOrder?.isInCombat() === false ||
                        turnOrder === undefined) && (
                        <Flex gap="xs" align="center">
                            <Button
                                onClick={() => {
                                    if (currentScene instanceof RpgScene) {
                                        let turnOrderInner: Maybe<RPGTurnOrder> =
                                            turnOrder;
                                        if (turnOrderInner === undefined) {
                                            turnOrderInner =
                                                TurnOrderFactory.create(
                                                    currentScene,
                                                );
                                        }

                                        const selections =
                                            currentScene.selectHandler.selections.reduce<
                                                RpgToken[]
                                            >((acc, selection) => {
                                                if (
                                                    selection instanceof
                                                    RpgToken
                                                ) {
                                                    acc.push(selection);
                                                }

                                                return acc;
                                            }, []);

                                        turnOrderInner.addToken(selections);

                                        queueEntityUpdate(() => {
                                            return turnOrderInner;
                                        });
                                    }
                                }}
                            >
                                Add selection to turn order
                            </Button>
                            <DeleteConfirmation
                                title="Clear turn order"
                                confirmText="Are you sure you want to clear turn order ?"
                                onDelete={() => {
                                    if (turnOrder !== undefined) {
                                        turnOrder.clear();

                                        queueEntityUpdate(() => {
                                            return turnOrder;
                                        });
                                    }
                                }}
                            />
                        </Flex>
                    )}
                    {turnOrder && turnOrder.isInCombat() === false && (
                        <Button
                            onClick={() => {
                                turnOrder.startCombat();

                                queueEntityUpdate(() => {
                                    return turnOrder;
                                });
                            }}
                        >
                            Start combat
                        </Button>
                    )}

                    {turnOrder && turnOrder.isInCombat() && (
                        <DeleteConfirmation
                            title="End combat"
                            confirmText="Are you sure you want to end combat ?"
                            onDelete={() => {
                                turnOrder.stopCombat();
                                queueEntityUpdate(() => {
                                    return turnOrder;
                                });
                            }}
                            target={<Button>End combat</Button>}
                        />
                    )}
                </Flex>
            </Fieldset>
        );
    };

    return (
        <Stack gap="xs" pb="xs" justify="center" align="stretch">
            {turnControls()}
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
    return (
        <Fieldset legend="Tokens in encounter">
            <Flex
                gap="xs"
                direction="column"
                mah="512px"
                style={{ overflow: "auto" }}
            >
                {children}
            </Flex>
        </Fieldset>
    );
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

export type TokenTurnEntrySpeedProps = {
    turnOrder: RPGTurnOrder;
    entry: TurnOrderEntry;
};

const Speed = ({ entry }: TokenTurnEntrySpeedProps) => {
    const speed = entry.speed;

    return <Text>Speed: {speed}</Text>;
};

export type TokenTurnEntryInitiativeProps = {
    turnOrder: RPGTurnOrder;
    entry: TurnOrderEntry;
};

const Initiative = ({ entry }: TokenTurnEntryInitiativeProps) => {
    const initiative = entry.initiative;

    return <Text>Initiative: {initiative}</Text>;
};

export type TokenTurnEntryDeathSaveProps = {
    turnOrder: RPGTurnOrder;
    entry: TurnOrderEntry;
};

const DeathSave = ({ entry }: TokenTurnEntryDeathSaveProps) => {
    const tokenData = entry.token.tokenData;
    const deathSaves = tokenData.deathSaves;

    return (
        <Stack>
            <Group>
                {Array.from({ length: 3 }).map((_, idx) => {
                    return (
                        <Radio
                            key={idx}
                            color="green"
                            readOnly
                            checked={idx < deathSaves.successes}
                        />
                    );
                })}
            </Group>
            <Group>
                {Array.from({ length: 3 }).map((_, idx) => {
                    return (
                        <Radio
                            key={idx}
                            color="red"
                            readOnly
                            checked={idx < deathSaves.failures}
                        />
                    );
                })}
            </Group>
        </Stack>
    );
};

TokenTurnEntry.Surprised = Surprised;
TokenTurnEntry.Speed = Speed;
TokenTurnEntry.Initiative = Initiative;
TokenTurnEntry.DeathSave = DeathSave;
