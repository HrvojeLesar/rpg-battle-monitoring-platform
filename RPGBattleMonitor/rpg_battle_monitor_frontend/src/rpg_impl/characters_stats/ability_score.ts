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

export function abilityScoreTypeToString(
    abilityScoreType: AbilityScoreType,
): string {
    switch (abilityScoreType) {
        case AbilityScoreType.Strength:
            return "Strength";
        case AbilityScoreType.Dexterity:
            return "Dexterity";
        case AbilityScoreType.Constitution:
            return "Constitution";
        case AbilityScoreType.Intelligence:
            return "Intelligence";
        case AbilityScoreType.Wisdom:
            return "Wisdom";
        case AbilityScoreType.Charisma:
            return "Charisma";
    }
}

export function abilityScoreTypeToShortString(
    abilityScoreType: AbilityScoreType,
): string {
    switch (abilityScoreType) {
        case AbilityScoreType.Strength:
            return "Str";
        case AbilityScoreType.Dexterity:
            return "Dex";
        case AbilityScoreType.Constitution:
            return "Con";
        case AbilityScoreType.Intelligence:
            return "Int";
        case AbilityScoreType.Wisdom:
            return "Wis";
        case AbilityScoreType.Charisma:
            return "Cha";
    }
}
