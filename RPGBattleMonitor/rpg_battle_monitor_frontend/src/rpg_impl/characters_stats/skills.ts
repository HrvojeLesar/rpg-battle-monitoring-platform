import { AbilityScoreType } from "./ability_score";
import { EntryValue } from "./utils";

export enum SkillType {
    Acrobatics = "acrobatics",
    AnimalHandling = "animal-handling",
    Arcana = "arcana",
    Athletics = "athletics",
    Deception = "deception",
    History = "history",
    Insight = "insight",
    Intimidation = "intimidation",
    Investigation = "investigation",
    Medicine = "medicine",
    Nature = "nature",
    Perception = "perception",
    Performance = "performance",
    Persuasion = "persuasion",
    Religion = "religion",
    SleightOfHand = "sleight-of-hand",
    Stealth = "stealth",
    Survival = "survival",
}

export function skillTypeToString(type: SkillType): string {
    switch (type) {
        case SkillType.Athletics:
            return "Athletics";
        case SkillType.Acrobatics:
            return "Acrobatics";
        case SkillType.SleightOfHand:
            return "Sleight of Hand";
        case SkillType.Stealth:
            return "Stealth";
        case SkillType.Arcana:
            return "Arcana";
        case SkillType.History:
            return "History";
        case SkillType.Investigation:
            return "Investigation";
        case SkillType.Nature:
            return "Nature";
        case SkillType.Religion:
            return "Religion";
        case SkillType.AnimalHandling:
            return "Animal Handling";
        case SkillType.Insight:
            return "Insight";
        case SkillType.Medicine:
            return "Medicine";
        case SkillType.Perception:
            return "Perception";
        case SkillType.Survival:
            return "Survival";
        case SkillType.Deception:
            return "Deception";
        case SkillType.Intimidation:
            return "Intimidation";
        case SkillType.Performance:
            return "Performance";
        case SkillType.Persuasion:
            return "Persuasion";
    }
}

export type AbilityScoreSkillMap = {
    [key in SkillType]: AbilityScoreType;
};

export const abilityScoreSkillMap: AbilityScoreSkillMap = {
    [SkillType.Athletics]: AbilityScoreType.Strength,
    [SkillType.Acrobatics]: AbilityScoreType.Dexterity,
    [SkillType.SleightOfHand]: AbilityScoreType.Dexterity,
    [SkillType.Stealth]: AbilityScoreType.Dexterity,
    [SkillType.Arcana]: AbilityScoreType.Intelligence,
    [SkillType.History]: AbilityScoreType.Intelligence,
    [SkillType.Investigation]: AbilityScoreType.Intelligence,
    [SkillType.Nature]: AbilityScoreType.Intelligence,
    [SkillType.Religion]: AbilityScoreType.Intelligence,
    [SkillType.AnimalHandling]: AbilityScoreType.Wisdom,
    [SkillType.Insight]: AbilityScoreType.Wisdom,
    [SkillType.Medicine]: AbilityScoreType.Wisdom,
    [SkillType.Perception]: AbilityScoreType.Wisdom,
    [SkillType.Survival]: AbilityScoreType.Wisdom,
    [SkillType.Deception]: AbilityScoreType.Charisma,
    [SkillType.Intimidation]: AbilityScoreType.Charisma,
    [SkillType.Performance]: AbilityScoreType.Charisma,
    [SkillType.Persuasion]: AbilityScoreType.Charisma,
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
