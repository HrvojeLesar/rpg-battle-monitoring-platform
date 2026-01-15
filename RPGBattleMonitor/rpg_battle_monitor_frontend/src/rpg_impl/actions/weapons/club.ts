import { BaseWeapon } from "./base_weapon";

export class Club extends BaseWeapon {
    public constructor() {
        super({
            baseDamage: "1d4",
            rangeFt: 5,
            damageType: "bludgeoning",
            targeting: ["hostile"],
            properties: ["Light"],
        });
    }
}
