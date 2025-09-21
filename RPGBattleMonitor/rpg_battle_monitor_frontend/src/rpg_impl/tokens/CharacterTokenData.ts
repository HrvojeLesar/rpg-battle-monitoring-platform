import { TypedJson } from "@/board_core/interfaces/messagable";
import { TokenDataBase } from "@/board_core/token/token_data";

export type RpgTokenAttributes = {
    image: Maybe<string>;
    tint: Maybe<number>;
    name: string;
};

export class RpgTokenData extends TokenDataBase<RpgTokenAttributes> {
    public tint: Maybe<number> = undefined;
    public image: Maybe<string> = undefined;
    public name: string = "Test token name";

    public constructor(options?: Partial<RpgTokenAttributes>) {
        super();

        this.image = options?.image;
        this.tint = options?.tint;
    }

    public getAttributes(): RpgTokenAttributes {
        return {
            image: this.image,
            tint: this.tint,
            name: this.name,
        };
    }

    public applyUpdateAction(
        changes: TypedJson<RpgTokenAttributes>,
    ): void {
        this.tint = changes.tint;
        this.image = changes.image;

        super.applyUpdateAction(changes);
    }
}
