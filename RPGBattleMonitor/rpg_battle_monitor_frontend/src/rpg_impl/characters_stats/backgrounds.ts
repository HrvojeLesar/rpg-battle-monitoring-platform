export type Background = {
    name: string;
};

export enum BackgroundNames {
    Acolyte = "acolyte",
    Charlatan = "charlatan",
    Criminal = "criminal",
    Entertainer = "entertainer",
    FolkHero = "folk hero",
    GuildArtisan = "guild artisan",
    Hermit = "hermit",
    Knight = "knight",
    Noble = "noble",
    Outlander = "outlander",
    Sage = "sage",
    Sailor = "sailor",
    Soldier = "soldier",
    Urchin = "urchin",
}

export const Backgrounds = {
    [BackgroundNames.Acolyte]: {
        name: BackgroundNames.Acolyte,
    },
    [BackgroundNames.Charlatan]: {
        name: BackgroundNames.Charlatan,
    },
    [BackgroundNames.Criminal]: {
        name: BackgroundNames.Criminal,
    },
    [BackgroundNames.Entertainer]: {
        name: BackgroundNames.Entertainer,
    },
    [BackgroundNames.FolkHero]: {
        name: BackgroundNames.FolkHero,
    },
    [BackgroundNames.GuildArtisan]: {
        name: BackgroundNames.GuildArtisan,
    },
    [BackgroundNames.Hermit]: {
        name: BackgroundNames.Hermit,
    },
    [BackgroundNames.Knight]: {
        name: BackgroundNames.Knight,
    },
    [BackgroundNames.Noble]: {
        name: BackgroundNames.Noble,
    },
    [BackgroundNames.Outlander]: {
        name: BackgroundNames.Outlander,
    },
    [BackgroundNames.Sage]: {
        name: BackgroundNames.Sage,
    },
    [BackgroundNames.Sailor]: {
        name: BackgroundNames.Sailor,
    },
    [BackgroundNames.Soldier]: {
        name: BackgroundNames.Soldier,
    },
    [BackgroundNames.Urchin]: {
        name: BackgroundNames.Urchin,
    },
};
