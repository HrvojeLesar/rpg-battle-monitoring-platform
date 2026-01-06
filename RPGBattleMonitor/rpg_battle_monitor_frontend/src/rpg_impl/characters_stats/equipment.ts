import { Action } from "../actions/action";
import { Maul } from "../actions/weapons/maul";

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
        properties: ["Heavy", "Two-Handed"],
    },
];
