import { ValueType } from "rc-input-number";

export function getPositiveNumber(input: ValueType | null): number | null {
    if (input === null) {
        return null;
    }

    if (typeof input === "string") {
        input = parseInt(input);
    }

    if (isNaN(input)) {
        return null;
    }

    if (input <= 0) {
        return null;
    }

    return input;
}
