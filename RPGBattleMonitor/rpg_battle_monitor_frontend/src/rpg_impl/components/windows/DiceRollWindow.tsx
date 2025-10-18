import { WindowEntry } from "@/board_react_wrapper/stores/window_store";
import { IconD12 } from "@/rpg_impl/icons/D12";
import { IconD20 } from "@/rpg_impl/icons/D20";
import { IconD4 } from "@/rpg_impl/icons/D4";
import { IconD6 } from "@/rpg_impl/icons/D6";
import { IconD8 } from "@/rpg_impl/icons/D8";
import { DiceIconProps } from "@/rpg_impl/icons/diceIconProps";
import { Button, Flex } from "@mantine/core";
import { useCallback, useRef, useState } from "react";

export const openDiceRollWindow = (): WindowEntry => {
    return {
        title: "Dice roll window",
        content: <DiceRoll diceSides={20} />,
        name: "dice-roll-window",
    };
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
    targetResult?: number;
    onFinished?: (result: number) => void;
    onRollStart?: () => number;
};

export const DiceRoll = (props: DiceRollProps) => {
    const { diceSides, targetResult, onFinished, onRollStart } = props;

    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState<Maybe<number>>(0);

    const timer = useRef<number>(0);

    const startRolling = useCallback(() => {
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

    return (
        <Flex direction="row" gap="xs">
            {getDiceIcon(diceSides, {
                number: result,
                size: 256,
                numberColor: colorCritical(),
            })}
            <Button
                mb="xs"
                disabled={rolling}
                onClick={() => {
                    timer.current = 0;
                    onRollStart?.();
                    startRolling();
                    setRolling(true);
                }}
            >
                Roll
            </Button>
        </Flex>
    );
};
