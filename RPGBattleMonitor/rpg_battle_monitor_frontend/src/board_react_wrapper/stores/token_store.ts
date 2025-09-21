import { atom } from "jotai";
import { TokenDataBase } from "@/board_core/token/token_data";
import { GBoard } from "@/board_core/board";

export type TokenStoreState = {
    tokens: TokenDataBase[];
};

const initialState: TokenStoreState = {
    tokens: [],
};

const tokenAtom = atom(initialState);

const tokens = atom((get) => {
    return get(tokenAtom).tokens;
});

const refreshTokens = atom(null, (_, set) => {
    set(tokenAtom, (state) => {
        const tokens = GBoard.entityRegistry.entities.list(
            (entity) => entity instanceof TokenDataBase,
        ) as TokenDataBase[];

        state.tokens = tokens;

        return { ...state };
    });
});

export const tokenAtoms = {
    tokenAtom,
    tokens,
    refreshTokens,
};
