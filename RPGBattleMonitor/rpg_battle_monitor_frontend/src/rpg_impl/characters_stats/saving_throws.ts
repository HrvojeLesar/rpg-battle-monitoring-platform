import { AbilityScoreType } from "./ability_score";
import { EntryValue } from "./utils";

export type SavingThrow = EntryValue;

export type SavingThrows = {
    [key in AbilityScoreType]: SavingThrow;
};

export function getEmptySavingThrows(): SavingThrows {
    return {
        [AbilityScoreType.Strength]: {
            score: 0,
            proficient: false,
        },
        [AbilityScoreType.Dexterity]: {
            score: 0,
            proficient: false,
        },
        [AbilityScoreType.Constitution]: {
            score: 0,
            proficient: false,
        },
        [AbilityScoreType.Intelligence]: {
            score: 0,
            proficient: false,
        },
        [AbilityScoreType.Wisdom]: {
            score: 0,
            proficient: false,
        },
        [AbilityScoreType.Charisma]: {
            score: 0,
            proficient: false,
        },
    };
}
