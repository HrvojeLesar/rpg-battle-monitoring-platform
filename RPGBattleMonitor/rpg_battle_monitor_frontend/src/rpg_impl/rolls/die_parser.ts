import { Die } from "./dice";

class DieParser {
    public constructor() {}

    public parse(dice: string): Die {
        const split = dice.split("d");

        if (split.at(0) === undefined || split.at(1) === undefined) {
            throw new Error("Invalid die format");
        }

        const dieOptions = {
            count: parseInt(split[0], 10),
            sides: parseInt(split[1], 10),
        };

        if (dieOptions.sides <= 0) {
            throw new Error("Die sides must be greater than 0");
        }

        if (dieOptions.count <= 0) {
            throw new Error("Die count must be greater than 0");
        }

        return new Die(dieOptions);
    }
}

export const GDieParser = new DieParser();
