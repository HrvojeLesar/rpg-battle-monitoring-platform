import { TypedJson } from "@/board_core/interfaces/messagable";
import { TokenDataBase } from "@/board_core/token/token_data";

export type CharacterTokenAttributes = {
    image: Maybe<string>;
    tint: Maybe<number>;
    name: string;
};

export class CharacterTokenData extends TokenDataBase<CharacterTokenAttributes> {
    public tint: Maybe<number> = undefined;
    public image: Maybe<string> = undefined;
    public name: string = "Test token name";

    public constructor(options?: Partial<CharacterTokenAttributes>) {
        super();

        this.image = options?.image;
        this.tint = options?.tint;
    }

    public getAttributes(): CharacterTokenAttributes {
        return {
            image: this.image,
            tint: this.tint,
            name: this.name,
        };
    }

    public applyUpdateAction(
        changes: TypedJson<CharacterTokenAttributes>,
    ): void {
        this.tint = changes.tint;
        this.image = changes.image;

        super.applyUpdateAction(changes);
    }
}
