import { atom } from "jotai";
import { TokenDataBase } from "@/board_core/token/token_data";
import { GBoard } from "@/board_core/board";
import { removeAndFlushEntities } from "@/board_core/utils/remove_and_flush_entities";

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

const deleteToken = atom(null, (get, set, token: TokenDataBase) => {
    set(tokenAtom, () => {
        removeAndFlushEntities(token);

        set(refreshTokens);

        return get(tokenAtom);
    });
});

export const tokenAtoms = {
    tokenAtom,
    tokens,
    refreshTokens,
    deleteToken,
};
