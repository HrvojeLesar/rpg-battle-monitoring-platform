export type AbilityScoreModifierFn = (score: number) => number;

export const abilityScoreModifier: AbilityScoreModifierFn = (score) => {
    return Math.floor((score - 10) / 2);
};

export type AbilityScore = {
    score: number;
    modifier: AbilityScoreModifierFn;
};

export enum AbilityScoreType {
    Strength = "strength",
    Dexterity = "dexterity",
    Constitution = "constitution",
    Intelligence = "intelligence",
    Wisdom = "iisdom",
    Charisma = "charisma",
}

export type AbilityScores = {
    [AbilityScoreType.Strength]: AbilityScore;
    [AbilityScoreType.Dexterity]: AbilityScore;
    [AbilityScoreType.Constitution]: AbilityScore;
    [AbilityScoreType.Intelligence]: AbilityScore;
    [AbilityScoreType.Wisdom]: AbilityScore;
    [AbilityScoreType.Charisma]: AbilityScore;
};

export function getEmptyAbilityScores(): AbilityScores {
    return {
        [AbilityScoreType.Strength]: {
            score: 10,
            modifier: abilityScoreModifier,
        },
        [AbilityScoreType.Dexterity]: {
            score: 10,
            modifier: abilityScoreModifier,
        },
        [AbilityScoreType.Constitution]: {
            score: 10,
            modifier: abilityScoreModifier,
        },
        [AbilityScoreType.Intelligence]: {
            score: 10,
            modifier: abilityScoreModifier,
        },
        [AbilityScoreType.Wisdom]: {
            score: 10,
            modifier: abilityScoreModifier,
        },
        [AbilityScoreType.Charisma]: {
            score: 10,
            modifier: abilityScoreModifier,
        },
    };
}
