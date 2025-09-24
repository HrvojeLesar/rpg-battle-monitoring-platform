export type AbilityScoreModifierFn = (
    score: number,
    modifierType: AbilityScoreType,
) => number;

export const abilityScoreModifier: AbilityScoreModifierFn = (
    score,
    _modifierType,
) => {
    return Math.floor((score - 10) / 2);
};

export type AbilityScore = {
    score: number;
};

export enum AbilityScoreType {
    Strength = "strength",
    Dexterity = "dexterity",
    Constitution = "constitution",
    Intelligence = "intelligence",
    Wisdom = "wisdom",
    Charisma = "charisma",
}

export type AbilityScores = {
    [key in AbilityScoreType]: AbilityScore;
};

export function getEmptyAbilityScores(): AbilityScores {
    return {
        [AbilityScoreType.Strength]: {
            score: 10,
        },
        [AbilityScoreType.Dexterity]: {
            score: 10,
        },
        [AbilityScoreType.Constitution]: {
            score: 10,
        },
        [AbilityScoreType.Intelligence]: {
            score: 10,
        },
        [AbilityScoreType.Wisdom]: {
            score: 10,
        },
        [AbilityScoreType.Charisma]: {
            score: 10,
        },
    };
}
