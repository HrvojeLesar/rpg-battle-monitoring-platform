import { AbilityScoreType } from "./ability_score";
import { EntryValue } from "./utils";

export enum SkillType {
    Athletics = "athletics",
    Acrobatics = "acrobatics",
    SleightOfHand = "sleight-of-hand",
    Stealth = "stealth",
    Arcana = "arcana",
    History = "history",
    Investigation = "investigation",
    Nature = "nature",
    Religion = "religion",
    AnimalHandling = "animal-handling",
    Insight = "insight",
    Medicine = "medicine",
    Perception = "perception",
    Survival = "survival",
    Deception = "deception",
    Intimidation = "intimidation",
    Performance = "performance",
    Persuasion = "persuasion",
}

export type AbilityScoreSkillMap = {
    [key in AbilityScoreType]: SkillType[];
};

export const abilityScoreSkillMap: AbilityScoreSkillMap = {
    [AbilityScoreType.Strength]: [SkillType.Athletics],
    [AbilityScoreType.Dexterity]: [
        SkillType.Acrobatics,
        SkillType.SleightOfHand,
        SkillType.Stealth,
    ],
    [AbilityScoreType.Constitution]: [],
    [AbilityScoreType.Intelligence]: [
        SkillType.Arcana,
        SkillType.History,
        SkillType.Investigation,
        SkillType.Nature,
        SkillType.Religion,
    ],
    [AbilityScoreType.Wisdom]: [
        SkillType.AnimalHandling,
        SkillType.Insight,
        SkillType.Medicine,
        SkillType.Perception,
        SkillType.Survival,
    ],
    [AbilityScoreType.Charisma]: [
        SkillType.Deception,
        SkillType.Intimidation,
        SkillType.Performance,
        SkillType.Persuasion,
    ],
};

export type SkillEntry = EntryValue;

export type Skills = {
    [key in SkillType]: SkillEntry;
};

export type PassiveWisdom = number;

export function getEmptySkills(): Skills {
    return {
        [SkillType.Athletics]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Acrobatics]: {
            score: 0,
            proficient: false,
        },
        [SkillType.SleightOfHand]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Stealth]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Arcana]: {
            score: 0,
            proficient: false,
        },
        [SkillType.History]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Investigation]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Nature]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Religion]: {
            score: 0,
            proficient: false,
        },
        [SkillType.AnimalHandling]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Insight]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Medicine]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Perception]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Survival]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Deception]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Intimidation]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Performance]: {
            score: 0,
            proficient: false,
        },
        [SkillType.Persuasion]: {
            score: 0,
            proficient: false,
        },
    };
}
