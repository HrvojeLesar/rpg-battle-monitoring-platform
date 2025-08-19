import { v7 as uuidv7 } from "uuid";
import { isDev } from "../../utils/dev_mode";

let uidCount = 0;

export default function newUId(): string {
    if (isDev()) {
        return `dev-${uidCount++}`;
    }
    return uuidv7();
}
