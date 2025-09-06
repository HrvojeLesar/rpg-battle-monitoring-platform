import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

const gameIdAtom = atomWithStorage<Maybe<number>>("gameId", undefined);

const getGameId = atom((get) => {
    return get(gameIdAtom);
});

const setGameId = atom(null, (_, set, id: Maybe<number>) => {
    set(gameIdAtom, id);
});

export const gameStore = {
    gameIdAtom,
    getGameId,
    setGameId,
};
