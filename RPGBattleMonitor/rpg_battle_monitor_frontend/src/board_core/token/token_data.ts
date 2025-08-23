import { BaseEntity } from "../entity/base_entity";

export abstract class TokenDataBase<T> extends BaseEntity<T> {
    public constructor() {
        super();
    }
}
