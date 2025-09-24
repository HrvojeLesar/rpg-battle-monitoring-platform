import { TypedJson } from "@/board_core/interfaces/messagable";
import {
    TokenDataBase,
    TokenDataBaseAttributes,
} from "@/board_core/token/token_data";
import {
    AbilityScores,
    getEmptyAbilityScores,
} from "../characters_stats/ability_score";
import { inspirationModifier } from "../characters_stats/inspiration";
import {
    getEmptySavingThrows,
    SavingThrows,
} from "../characters_stats/saving_throws";
import { PassiveWisdom } from "../characters_stats/skills";
import {
    ArmorClass,
    DeathSaves,
    getEmptyDeahtSaves,
    getEmptyHitPoints,
    HitDice,
    HitPoints,
    Initiative,
    Speed,
    Size,
    getEmptySpeed,
} from "../characters_stats/combat";
import { CharacterClass } from "../characters_stats/class";
import { Race } from "../characters_stats/race";
import { Background } from "../characters_stats/backgrounds";
import { Alignment } from "@floating-ui/react";
import { Equipment, getEmptyEquipment } from "../characters_stats/equipment";

export type RpgTokenAttributes = {
    tint: Maybe<number>;
    name: string;
    class: CharacterClass;
    background: Maybe<Background>;
    playerName: Maybe<string>;
    race: Maybe<Race>;
    alignment: Maybe<Alignment>;
    experience: number;
    equipment: Equipment;
    abilityScore: AbilityScores;
    inspirationModifier: inspirationModifier;
    savingThrows: SavingThrows;
    passiveWisdom: PassiveWisdom;
    armorClass: ArmorClass;
    initiative: Initiative;
    speed: Speed;
    hitPoints: HitPoints;
    hitDice: HitDice;
    deathSaves: DeathSaves;
    size: Size;
} & TokenDataBaseAttributes;

export class RpgTokenData extends TokenDataBase<RpgTokenAttributes> {
    public name: string = "Test token name";

    public class: CharacterClass;
    public background: Maybe<Background>;
    public playerName: Maybe<string>;
    public race: Maybe<Race>;
    public alignment: Maybe<Alignment>;
    public experience: number;

    public equipment: Equipment;
    public abilityScore: AbilityScores;
    public inspirationModifier: inspirationModifier;
    public savingThrows: SavingThrows;
    public passiveWisdom: PassiveWisdom;
    public armorClass: ArmorClass;
    public initiative: Initiative;
    public speed: Speed;
    public hitPoints: HitPoints;
    public hitDice: HitDice;
    public deathSaves: DeathSaves;

    public size: Size;

    public tint: Maybe<number> = undefined;

    // TODO: Spellcasting, cantrips, spell slots
    //
    // TODO: Other proficiencies & languages
    // TODO: Features & traits
    // TODO: Attacks & Spellcasting
    // TODO: Personality traits, ideals, bonds, flaws
    // TODO: Age, height, wegith, eyes, skin, hair
    // TODO: Character appearance

    public constructor(options?: Partial<RpgTokenAttributes>) {
        super(options);

        this.image = options?.image;

        this.class = options?.class ?? [];
        this.background = options?.background;
        this.playerName = options?.playerName;
        this.race = options?.race;
        this.alignment = options?.alignment;
        this.experience = options?.experience ?? 0;
        this.equipment = options?.equipment ?? getEmptyEquipment();
        this.abilityScore = options?.abilityScore ?? getEmptyAbilityScores();
        this.inspirationModifier = options?.inspirationModifier ?? 0;
        this.savingThrows = options?.savingThrows ?? getEmptySavingThrows();
        this.passiveWisdom = options?.passiveWisdom ?? 0;
        this.armorClass = options?.armorClass ?? 0;
        this.initiative = options?.initiative ?? 0;
        this.speed = options?.speed ?? getEmptySpeed();
        this.hitPoints = options?.hitPoints ?? getEmptyHitPoints();
        this.hitDice = options?.hitDice ?? 0;
        this.deathSaves = options?.deathSaves ?? getEmptyDeahtSaves();
        this.size = options?.size ?? "medium";
    }

    public getAttributes(): RpgTokenAttributes {
        return {
            ...(super.getAttributes() as TokenDataBaseAttributes),
            tint: this.tint,
            name: this.name,
            class: this.class,
            background: this.background,
            playerName: this.playerName,
            race: this.race,
            alignment: this.alignment,
            experience: this.experience,
            equipment: this.equipment,
            abilityScore: this.abilityScore,
            inspirationModifier: this.inspirationModifier,
            savingThrows: this.savingThrows,
            passiveWisdom: this.passiveWisdom,
            armorClass: this.armorClass,
            initiative: this.initiative,
            speed: this.speed,
            hitPoints: this.hitPoints,
            hitDice: this.hitDice,
            deathSaves: this.deathSaves,
            size: this.size,
        };
    }

    public applyUpdateAction(changes: TypedJson<RpgTokenAttributes>): void {
        this.tint = changes.tint;
        this.name = changes.name;
        this.class = changes.class;
        this.background = changes.background;
        this.playerName = changes.playerName;
        this.race = changes.race;
        this.alignment = changes.alignment;
        this.experience = changes.experience;
        this.equipment = changes.equipment;
        this.abilityScore = changes.abilityScore;
        this.inspirationModifier = changes.inspirationModifier;
        this.savingThrows = changes.savingThrows;
        this.passiveWisdom = changes.passiveWisdom;
        this.armorClass = changes.armorClass;
        this.initiative = changes.initiative;
        this.speed = changes.speed;
        this.hitPoints = changes.hitPoints;
        this.hitDice = changes.hitDice;
        this.deathSaves = changes.deathSaves;
        this.size = changes.size;

        super.applyUpdateAction(changes);
    }
}
