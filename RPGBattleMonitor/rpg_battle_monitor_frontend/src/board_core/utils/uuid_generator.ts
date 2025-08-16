import { v7 as uuidv7 } from "uuid";

export default function newUId(): string {
    return uuidv7();
}
