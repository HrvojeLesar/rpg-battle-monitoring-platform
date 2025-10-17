import { WindowEntry } from "@/board_react_wrapper/stores/window_store";
import { Button, Flex, Text } from "@mantine/core";
import { useCallback, useState } from "react";

export const openDiceRollWindow = (): WindowEntry => {
    return {
        title: "Dice roll window",
        content: <DiceRoll />,
        name: "dice-roll-window",
    };
};

export type DiceRollProps = {
    targetResult: number;
    onFinished: () => void;
    diceSides: number;
    roll: () => number;
};

export const DiceRoll = () => {
    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState<Maybe<number>>(0);

    const startRolling = useCallback(() => {
        let timer = 0;

        const interval = setInterval(
            () => {
                setResult(Math.floor(Math.random() * 6) + 1);

                timer += 1;

                if (timer >= 20) {
                    clearInterval(interval);
                    setRolling(false);
                }
            },
            Math.random() * 75 + 50,
        );

        return () => {
            clearInterval(interval);
        };
    }, []);

    const text = () => {
        if (result === undefined) {
            return "Not rolling";
        }

        if (rolling) {
            return "Rolling..." + result;
        }

        return result;
    };

    return (
        <Flex direction="column" gap="xs">
            <Text>{text()}</Text>
            <Button
                mb="xs"
                disabled={rolling}
                onClick={() => {
                    startRolling();
                    setRolling(true);
                }}
            >
                Roll
            </Button>
        </Flex>
    );
};
