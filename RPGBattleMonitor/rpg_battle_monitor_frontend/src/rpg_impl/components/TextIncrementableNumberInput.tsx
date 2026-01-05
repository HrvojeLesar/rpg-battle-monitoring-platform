import { Input, MantineStyleProp } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";

export type TextIncrementableNumberInputProps = {
    label?: string;
    placeholder?: string;
    wrapperStyle?: MantineStyleProp;
    inputStyle?: MantineStyleProp;
    onChange?: (value: number) => void;
    initialValue?: number;
    disabled?: boolean;
    rightSection?: JSX.Element;
};

export const isNumber = (value: string): boolean => {
    return (
        (typeof value === "number"
            ? value < Number.MAX_SAFE_INTEGER
            : !Number.isNaN(Number(value))) &&
        !Number.isNaN(value) &&
        value !== ""
    );
};

export const TextIncrementableNumberInput = (
    props: TextIncrementableNumberInputProps,
) => {
    const {
        label,
        placeholder,
        wrapperStyle,
        inputStyle,
        initialValue,
        onChange,
        disabled,
        rightSection,
    } = props;

    const [value, setValue] = useState<number | string>(initialValue ?? "");
    const [input, setInput] = useState<number | string>(value);

    useEffect(() => {
        setValue(initialValue ?? "");
        setInput(initialValue ?? "");
    }, [initialValue]);

    const updateValue = useCallback(
        (inputValue: number | string) => {
            const calculateNewValue = (
                inputValue: number | string,
            ): Maybe<number> => {
                if (typeof inputValue === "number") {
                    return inputValue;
                }

                const signedNumberRegex = /([+-])?(\d+\.?\d*|\.\d+)/g;
                const matches = [...inputValue.matchAll(signedNumberRegex)];
                const match = matches.at(0);
                if (match === undefined) {
                    return undefined;
                }
                const sign = match.at(1);
                const number = match.at(2);

                if (number === undefined) {
                    return undefined;
                }

                if (!isNumber(number)) {
                    return undefined;
                }

                const readValue = Number(number);
                let newValue: number = readValue;
                if (sign !== undefined) {
                    newValue = (Number(value) +
                        (sign === "-"
                            ? -readValue
                            : readValue)) as unknown as number;
                }

                return newValue;
            };

            const newValue = calculateNewValue(inputValue);

            if (newValue === value) {
                return;
            }

            if (newValue !== undefined) {
                setValue(newValue);
                setInput(newValue);
                onChange?.(newValue);
            } else {
                setInput(value);
            }
        },
        [value, onChange],
    );

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                updateValue(input);
            }}
        >
            <Input.Wrapper style={wrapperStyle} label={label}>
                <Input
                    autoComplete="off"
                    disabled={disabled}
                    style={inputStyle}
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        setInput(inputValue);
                    }}
                    onBlur={() => {
                        updateValue(input);
                    }}
                    rightSection={rightSection}
                />
            </Input.Wrapper>
        </form>
    );
};
