import { TypedJson } from "@/board_core/interfaces/messagable";
import {
    TokenDataBase,
    TokenDataBaseAttributes,
} from "@/board_core/token/token_data";

export type RpgTokenAttributes = {
    tint: Maybe<number>;
    name: string;
} & TokenDataBaseAttributes;

type Race = string;
type Class = string;
type Classes = Class[];

type Currency = {
    gold: number;
    silver: number;
    copper: number;
};

type Item = string;

type Equipment = {
    currency: Currency;
    backpack: Item[];
};

export class RpgTokenData extends TokenDataBase<RpgTokenAttributes> {
    public name: string = "Test token name";
    public tint: Maybe<number> = undefined;

    public race: Maybe<Race> = undefined;
    public classes: Classes = [];
    public equipment: Equipment = {
        currency: {
            gold: 0,
            silver: 0,
            copper: 0,
        },
        backpack: [],
    };

    public constructor(options?: Partial<RpgTokenAttributes>) {
        super(options);

        this.image = options?.image;
    }

    public getAttributes(): RpgTokenAttributes {
        return {
            ...(super.getAttributes() as TokenDataBaseAttributes),
            tint: this.tint,
            name: this.name,
        };
    }

    public applyUpdateAction(changes: TypedJson<RpgTokenAttributes>): void {
        this.tint = changes.tint;

        super.applyUpdateAction(changes);
    }
}
