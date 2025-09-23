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
