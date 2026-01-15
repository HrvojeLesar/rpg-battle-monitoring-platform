import { BaseWeapon } from "./base_weapon";

export class Handaxe extends BaseWeapon {
    public constructor() {
        super({
            baseDamage: "1d6",
            rangeFt: 5,
            damageType: "slashing",
            targeting: ["hostile"],
            properties: ["Light", "Range", "Thrown"],
        });
    }
}
