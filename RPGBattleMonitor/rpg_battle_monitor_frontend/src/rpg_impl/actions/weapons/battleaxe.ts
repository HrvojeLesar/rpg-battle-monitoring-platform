import { BaseWeapon } from "./base_weapon";

export class Battleaxe extends BaseWeapon {
    public constructor() {
        super({
            baseDamage: "1d8",
            rangeFt: 5,
            damageType: "slashing",
            targeting: ["hostile"],
            properties: ["Versatile"],
        });
    }
}
