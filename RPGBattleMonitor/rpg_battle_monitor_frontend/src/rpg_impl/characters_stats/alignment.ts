export enum Alignment {
    LawfulGood = "lawful-good",
    NeutralGood = "neutral-good",
    ChaoticGood = "chaotic-good",
    LawfulNeutral = "lawful-neutral",
    TrueNeutral = "true-neutral",
    ChaoticNeutral = "chaotic-neutral",
    LawfulEvil = "lawful-evil",
    NeutralEvil = "neutral-evil",
    ChaoticEvil = "chaotic-evil",
}

export function alignmentToString(alignment: Alignment): string {
    switch (alignment) {
        case Alignment.LawfulGood:
            return "Lawful Good";
        case Alignment.NeutralGood:
            return "Neutral Good";
        case Alignment.ChaoticGood:
            return "Chaotic Good";
        case Alignment.LawfulNeutral:
            return "Lawful Neutral";
        case Alignment.TrueNeutral:
            return "True Neutral";
        case Alignment.ChaoticNeutral:
            return "Chaotic Neutral";
        case Alignment.LawfulEvil:
            return "Lawful Evil";
        case Alignment.NeutralEvil:
            return "Neutral Evil";
        case Alignment.ChaoticEvil:
            return "Chaotic Evil";
    }
}
