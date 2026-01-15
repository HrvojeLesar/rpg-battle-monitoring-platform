import { BaseWeapon } from "./base_weapon";

export class LightCrossbow extends BaseWeapon {
    public constructor() {
        super({
            baseDamage: "1d8",
            rangeFt: "80/320",
            damageType: "piercing",
            targeting: ["hostile"],
            properties: ["Ammunition", "Loading", "Two-Handed"],
        });
    }
}
