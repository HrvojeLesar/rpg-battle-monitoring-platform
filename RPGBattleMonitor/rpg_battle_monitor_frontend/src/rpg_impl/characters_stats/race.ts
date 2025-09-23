export enum Races {
    Dwarf = "dwarf",
    Elf = "elf",
    Halfling = "halfling",
    Human = "human",
    Dragonborn = "dragonborn",
    Gnome = "gnome",
    HalfElf = "half-elf",
    HalfOrc = "half-orc",
    Tiefling = "tiefling",
}

export type Race = keyof typeof Races | string;
