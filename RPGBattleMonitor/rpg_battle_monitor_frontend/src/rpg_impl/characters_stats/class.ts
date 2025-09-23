export type Class = {
    name: CharacterClassNames | string;
    level: number;
};

export type CharacterClass = Class[];

export enum CharacterClassNames {
    Barbarian = "barbarian",
    Bard = "bard",
    Cleric = "cleric",
    Druid = "druid",
    Fighter = "fighter",
    Monk = "monk",
    Paladin = "paladin",
    Ranger = "ranger",
    Rogue = "rogue",
    Sorcerer = "sorcerer",
    Warlock = "warlock",
    Wizard = "wizard",
}
