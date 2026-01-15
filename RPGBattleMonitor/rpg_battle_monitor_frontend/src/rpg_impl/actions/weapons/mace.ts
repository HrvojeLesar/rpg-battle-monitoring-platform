import { BaseWeapon } from "./base_weapon";

export class Mace extends BaseWeapon {
    public constructor() {
        super({
            baseDamage: "1d6",
            rangeFt: 5,
            damageType: "slashing",
            targeting: ["hostile"],
        });
    }
}
