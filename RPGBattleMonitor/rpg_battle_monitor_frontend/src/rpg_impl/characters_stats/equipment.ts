import { Action } from "../actions/action";
import { Battleaxe } from "../actions/weapons/battleaxe";
import { Club } from "../actions/weapons/club";
import { Handaxe } from "../actions/weapons/handaxe";
import { LightCrossbow } from "../actions/weapons/light_crossbow";
import { Mace } from "../actions/weapons/mace";
import { Maul } from "../actions/weapons/maul";
import { Shortbow } from "../actions/weapons/shortbow";
import { RpgTokenData } from "../tokens/rpg_token_data";

export type Currency = {
    gold: number;
    silver: number;
    electrum: number;
    copper: number;
    platinum: number;
};

export type Equipment = {
    currency: Currency;
    backpack: Item[];
};

export function getEmptyEquipment(): Equipment {
    return {
        currency: {
            gold: 0,
            silver: 0,
            electrum: 0,
            copper: 0,
            platinum: 0,
        },
        backpack: [],
    };
}

export type ItemDisplay = {
    name: string;
    description?: string;
};

export type Item = ItemDisplay & {
    action?: Action;
    quantity?: number;
    baseDamage?: string;
    damageType?: string;
    properties?: string[];
    wight?: number;
};

export const PREDEFINED_ITEMS: Item[] = [
    {
        name: "Maul",
        action: new Maul(),
    },
    {
        name: "Battleaxe",
        action: new Battleaxe(),
    },
    {
        name: "Club",
        action: new Club(),
    },
    {
        name: "Handaxe",
        action: new Handaxe(),
    },
    {
        name: "Light crossbow",
        action: new LightCrossbow(),
    },
    {
        name: "Mace",
        action: new Mace(),
    },
    {
        name: "Shortbow",
        action: new Shortbow(),
    },
];

export const formatPredefinedItem = (
    item: Item,
    token: RpgTokenData,
): string => {
    if (item.action === undefined) return item.name;

    return `${item.name} (${item.action.baseDamage})`;
};
