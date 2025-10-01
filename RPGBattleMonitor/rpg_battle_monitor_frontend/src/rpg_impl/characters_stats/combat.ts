export type ArmorClass = number;
export type Initiative = number;
export type Speed = {
    walk: number;
    fly: number;
    swim: number;
    climb: number;
};

export type HitPoints = {
    maximum: number;
    current: number;
    temporary: number;
};

export type HitDice = number;
export type DeathSaves = {
    successes: number;
    failures: number;
};

export type Size =
    | "tiny"
    | "small"
    | "medium"
    | "large"
    | "huge"
    | "gargantuan";

export function getEmptyHitPoints(): HitPoints {
    return {
        maximum: 0,
        current: 0,
        temporary: 0,
    };
}

export function getEmptyDeahtSaves(): DeathSaves {
    return {
        successes: 0,
        failures: 0,
    };
}

export function sizeToGridCellMultiplier(size: Size): number {
    switch (size) {
        case "tiny":
            return 0.5;
        case "small":
            return 1;
        case "medium":
            return 1;
        case "large":
            return 2;
        case "huge":
            return 3;
        case "gargantuan":
            return 4;
        default:
            return 1;
    }
}

export function getEmptySpeed(): Speed {
    return {
        walk: 30,
        fly: 0,
        swim: 0,
        climb: 0,
    };
}

export const sizeMap = [
    { value: "tiny", label: "Tiny" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "huge", label: "Huge" },
    { value: "gargantuan", label: "Gargantuan" },
];

export function isValidSize(size: Option<string>): boolean {
    if (size === null || size === undefined) {
        return false;
    }

    return sizeMap.map((s) => s.value).includes(size);
}
