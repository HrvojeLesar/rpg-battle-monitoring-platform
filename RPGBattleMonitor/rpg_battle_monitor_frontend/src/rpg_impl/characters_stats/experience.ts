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

export function calculateProficiencyBonus(level: number) {
    switch (level) {
        case 1:
        case 2:
        case 3:
        case 4:
            return 2;
        case 5:
        case 6:
        case 7:
        case 8:
            return 3;
        case 9:
        case 10:
        case 11:
        case 12:
            return 4;
        case 13:
        case 14:
        case 15:
        case 16:
            return 5;
        case 17:
        case 18:
        case 19:
        case 20:
            return 6;
        default:
            return 2;
    }
}

export function getEmptyExperience(): Experience {
    const value = 0;
    const level = calculateLevel(value);
    return {
        value,
        level,
    };
}
