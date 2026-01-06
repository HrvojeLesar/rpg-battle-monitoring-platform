import { WindowEntry } from "@/board_react_wrapper/stores/window_store";
import { DamageResult } from "@/rpg_impl/actions/action";
import { IconD12 } from "@/rpg_impl/icons/D12";
import { IconD20 } from "@/rpg_impl/icons/D20";
import { IconD4 } from "@/rpg_impl/icons/D4";
import { IconD6 } from "@/rpg_impl/icons/D6";
import { IconD8 } from "@/rpg_impl/icons/D8";
import { DiceIconProps } from "@/rpg_impl/icons/diceIconProps";
import { GD20, Roll, Rolls } from "@/rpg_impl/rolls/dice";
import { Button, Flex, Tabs } from "@mantine/core";
import { useSet } from "@mantine/hooks";
import { useCallback, useEffect, useRef, useState } from "react";

type DiceRollWindow = {
    onClose: () => void;
    act: () => void;
    title?: string;
    uniqueName?: string;
};

export type OpenAttackDiceRollWindowProps = DiceRollWindow & {
    damageResults: DamageResult[];
};

export const openAttackDiceRollWindow = (
    props: OpenAttackDiceRollWindowProps,
): WindowEntry => {
    const { onClose, title, uniqueName } = props;
    return {
        title: title ?? "Dice roll window",
        content: <AttackDiceCollection {...props} />,
        name: uniqueName ?? "dice-roll-window",
        onClose: onClose,
    };
};

export type OpenDiceRollWindowProps = DiceRollWindow & {
    results: Rolls;
    onFinished?: ({
        rolls,
        roll,
        act,
    }: {
        rolls: Rolls;
        roll: Roll;
        act: () => void;
    }) => void;
};

export const openRollWindow = (props: OpenDiceRollWindowProps): WindowEntry => {
    const { onClose, title, uniqueName } = props;
    return {
        title: title ?? "Dice roll window",
        content: <DiceCollection {...props} />,
        name: uniqueName ?? "dice-roll-window",
        onClose: onClose,
    };
};

export type AttackDiceCollectionProps = OpenAttackDiceRollWindowProps;

export const AttackDiceCollection = (props: AttackDiceCollectionProps) => {
    const { act, damageResults } = props;
    const [shouldRollAttack, setShouldRollAttack] = useState(false);
    const [shouldRollDamage, setShouldRollDamage] = useState(false);

    const finishedAttackRolls = useSet<string>([]);
    const finishedDamageRolls = useSet<string>([]);

    const finishedAttackRollCount = finishedAttackRolls.size;
    const finishedDamageRollCount = finishedDamageRolls.size;

    if (damageResults.length === 0) {
        throw new Error("No damage results, cannot open dice roll window");
    }

    const attackRolls = damageResults.filter(
        (result) => result.damage.attackRolls !== undefined,
    );

    const damageRolls = damageResults.filter(
        (result) => result.damage.damageRolls !== undefined,
    );

    const attackRollCount = attackRolls.reduce(
        (acc, result) => acc + (result.damage.attackRolls?.rolls.length ?? 0),
        0,
    );

    const displayAttackRolls = () => {
        return (
            <>
                {attackRolls.map((result, idx) => {
                    const die = result.damage.attackRolls?.die ?? GD20;
                    const rolls = result.damage.attackRolls?.rolls ?? [];

                    return rolls.map((roll, rIdx) => {
                        const key = `${idx}-${rIdx}`;

                        return (
                            <DiceRoll
                                key={key}
                                diceSides={die.sides}
                                targetResult={roll.value}
                                roll={shouldRollAttack}
                                onFinished={() => {
                                    finishedAttackRolls.add(key);
                                }}
                            />
                        );
                    });
                })}
            </>
        );
    };

    const displayDamageRolls = () => {
        return (
            <>
                {damageRolls.map((result, idx) => {
                    const die = result.damage.damageRolls?.die ?? GD20;
                    const rolls = result.damage.damageRolls?.rolls ?? [];

                    return rolls.map((roll, rIdx) => {
                        const key = `${idx}-${rIdx}`;

                        return (
                            <DiceRoll
                                key={key}
                                diceSides={die.sides}
                                targetResult={roll.value}
                                roll={shouldRollDamage}
                                onFinished={() => {
                                    finishedDamageRolls.add(key);
                                }}
                            />
                        );
                    });
                })}
            </>
        );
    };

    useEffect(() => {
        if (
            damageRolls.length > 0 &&
            finishedDamageRollCount === damageRolls.length
        ) {
            act();
        }
    }, [act, finishedDamageRollCount, damageRolls.length]);

    return (
        <Tabs defaultValue="attack">
            <Tabs.List>
                <Tabs.Tab value="attack">Roll attack</Tabs.Tab>
                {finishedAttackRollCount == attackRollCount &&
                    damageRolls.length > 0 && (
                        <Tabs.Tab value="damage">Roll damage</Tabs.Tab>
                    )}
            </Tabs.List>
            <Tabs.Panel value="attack">
                <Flex direction="column" gap="xs">
                    {displayAttackRolls()}
                    <Button
                        mb="xs"
                        disabled={shouldRollAttack}
                        onClick={() => {
                            setShouldRollAttack(true);
                        }}
                    >
                        Roll
                    </Button>
                </Flex>
            </Tabs.Panel>
            {finishedAttackRollCount == attackRollCount && (
                <Tabs.Panel value="damage">
                    <Flex direction="column" gap="xs">
                        {displayDamageRolls()}
                        <Button
                            mb="xs"
                            disabled={shouldRollDamage}
                            onClick={() => {
                                setShouldRollDamage(true);
                            }}
                        >
                            Roll damage
                        </Button>
                    </Flex>
                </Tabs.Panel>
            )}
        </Tabs>
    );
};

export type DiceCollectionProps = OpenDiceRollWindowProps;

export const DiceCollection = (props: DiceCollectionProps) => {
    const { act, results, onFinished } = props;

    const [shouldRoll, setShouldRoll] = useState(false);

    const displayRolls = () => {
        const die = results.die;
        return (
            <>
                {results.rolls.map((result, idx) => {
                    return (
                        <DiceRoll
                            key={idx}
                            diceSides={die.sides}
                            targetResult={result.value}
                            roll={shouldRoll}
                            onFinished={() => {
                                onFinished?.({
                                    rolls: results,
                                    roll: result,
                                    act,
                                });
                            }}
                        />
                    );
                })}
            </>
        );
    };

    return (
        <Flex direction="column" gap="xs">
            {displayRolls()}
            <Button
                mb="xs"
                disabled={shouldRoll}
                onClick={() => {
                    setShouldRoll(true);
                }}
            >
                Roll
            </Button>
        </Flex>
    );
};

export const getDiceIcon = (diceSides: number, props: DiceIconProps) => {
    switch (diceSides) {
        case 4:
            return <IconD4 {...props} />;
        case 6:
            return <IconD6 {...props} />;
        case 8:
            return <IconD8 {...props} />;
        case 12:
            return <IconD12 {...props} />;
        case 20:
            return <IconD20 {...props} />;
        default:
            return <IconD20 {...props} />;
    }
};

export type DiceRollProps = {
    diceSides: number;
    roll?: boolean;
    targetResult?: number;
    onFinished?: (result: number) => void;
    onRollStart?: () => number;
};

export const DiceRoll = (props: DiceRollProps) => {
    const { diceSides, targetResult, onFinished, onRollStart, roll } = props;

    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState<Maybe<number>>(0);
    const [rolled, setRolled] = useState(false);

    const timer = useRef<number>(0);

    const startRolling = useCallback(() => {
        setRolling(true);
        timer.current = 0;
        const interval = setInterval(
            () => {
                const result = Math.floor(Math.random() * diceSides) + 1;
                setResult(result);

                timer.current += 1;

                if (timer.current >= 20) {
                    clearInterval(interval);
                    setRolling(false);
                    if (targetResult) {
                        setResult(targetResult);
                    }
                    onFinished?.(targetResult ?? result);
                    setRolled(true);
                }
            },
            Math.random() * 75 + 50,
        );

        return () => {
            clearInterval(interval);
        };
    }, [diceSides, onFinished, targetResult]);

    const colorCritical = () => {
        if (rolling === true) {
            return undefined;
        }

        if (result === diceSides) {
            return "var(--mantine-color-green-outline)";
        }

        if (result === 1) {
            return "var(--mantine-color-red-outline)";
        }

        return undefined;
    };

    if (roll && !rolling && !rolled) {
        console.log("start rolling", roll, rolling);
        startRolling();
    }

    return (
        <Flex direction="column" gap="xs">
            {getDiceIcon(diceSides, {
                number: result,
                size: 256,
                numberColor: colorCritical(),
            })}
            {roll === undefined && (
                <Button
                    mb="xs"
                    disabled={rolling}
                    onClick={() => {
                        onRollStart?.();
                        startRolling();
                    }}
                >
                    Roll
                </Button>
            )}
        </Flex>
    );
};
