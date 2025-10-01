export type Experience = {
    value: number;
    level: number;
};

export const experienceLevelMap = [
    Number.NEGATIVE_INFINITY,
    300,
    900,
    2700,
    6500,
    14000,
    23000,
    34000,
    48000,
    64000,
    85000,
    100000,
    120000,
    140000,
    165000,
    195000,
    225000,
    265000,
    305000,
    355000,
];

export function calculateLevel(experience: number): number {
    for (let level = experienceLevelMap.length; level >= 1; level--) {
        if (experience >= experienceLevelMap[level - 1]) {
            return level;
        }
    }

    return 1;
}

export function getEmptyExperience(): Experience {
    const value = 0;
    return {
        value,
        level: calculateLevel(value),
    };
}
