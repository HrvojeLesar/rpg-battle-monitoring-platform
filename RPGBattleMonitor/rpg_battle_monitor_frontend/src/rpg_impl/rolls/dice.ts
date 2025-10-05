import { GDieParser } from "./die_parser";

export type DieOptions = {
    sides: number;
    count: number;
};

export type Roll = {
    value: number;
    isCritialFailure: boolean;
    isCriticalSuccess: boolean;
    isLucky: boolean;
    otherValue?: number;
};

export type Rolls = {
    die: Die;
    rolls: Roll[];
};

export type RollOptions = {
    isLucky?: boolean;
    isCritical?: boolean;
};

export class Die {
    public sides: number;
    public count: number;

    public constructor(options: DieOptions) {
        this.sides = options.sides;
        this.count = options.count;
    }

    public roll(options?: RollOptions): Rolls {
        const rolls: Roll[] = [];
        for (let i = 0; i < this.count * (options?.isLucky ? 2 : 1); i++) {
            let value = Math.floor(Math.random() * this.sides) + 1;
            let otherValue = undefined;
            if (options?.isLucky) {
                otherValue = Math.floor(Math.random() * this.sides) + 1;
                if (otherValue > value) {
                    const temp = value;
                    value = otherValue;
                    otherValue = temp;
                }
            }
            rolls.push({
                value,
                isCritialFailure: value === 1,
                isCriticalSuccess: value === this.sides,
                isLucky: options?.isLucky ?? false,
                otherValue,
            });
        }

        return { die: this, rolls };
    }
}

export const GD20 = GDieParser.parse("1d20");

export const printRolls = (title: string, rolls: Rolls) => {
    console.group("Rolls for", title);
    console.log("Rolling", `${rolls.die.count}"d"${rolls.die.sides}`);
    console.log("Rolled", rolls.rolls);
    console.groupEnd();
};
