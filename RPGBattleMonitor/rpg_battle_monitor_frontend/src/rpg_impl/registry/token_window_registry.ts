import { Token } from "@/board_core/token/token";
import { TokenDataBase } from "@/board_core/token/token_data";

type Handler = (token?: TokenDataBase | Token) => void;

type RegisteredHandler = {
    handler: Handler;
    tokenClass: TokenClass;
};

interface TokenClass {
    new (): TokenDataBase;
}

class TokenWindowRegistry {
    protected handlers: RegisteredHandler[] = [];

    public registerHandler(handler: Handler, tokenClass: TokenClass) {
        this.handlers.push({ handler, tokenClass });
    }

    public openWindow(token: TokenDataBase | Token) {
        this.handlers.forEach(({ handler, tokenClass }) => {
            if (token instanceof tokenClass) {
                handler(token);
            }
        });
    }
}

export const GTokenWindowRegistry = new TokenWindowRegistry();
