export type Item = string;

export type Currency = {
    gold: number;
    silver: number;
    copper: number;
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
            copper: 0,
        },
        backpack: [],
    };
}
