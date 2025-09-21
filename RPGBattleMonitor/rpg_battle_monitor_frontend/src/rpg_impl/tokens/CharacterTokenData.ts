import { TypedJson } from "@/board_core/interfaces/messagable";
import {
    TokenDataBase,
    TokenDataBaseAttributes,
} from "@/board_core/token/token_data";

export type RpgTokenAttributes = {
    tint: Maybe<number>;
    name: string;
} & TokenDataBaseAttributes;

export class RpgTokenData extends TokenDataBase<RpgTokenAttributes> {
    public name: string = "Test token name";
    public tint: Maybe<number> = undefined;

    public constructor(options?: Partial<RpgTokenAttributes>) {
        super(options);

        this.image = options?.image;
    }

    public getAttributes(): RpgTokenAttributes {
        return {
            ...super.getAttributes(),
            tint: this.tint,
            name: this.name,
        };
    }

    public applyUpdateAction(changes: TypedJson<RpgTokenAttributes>): void {
        this.tint = changes.tint;

        super.applyUpdateAction(changes);
    }
}
