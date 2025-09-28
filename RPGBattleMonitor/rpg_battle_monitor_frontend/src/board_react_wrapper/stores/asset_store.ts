import { atom } from "jotai";
import { Asset } from "@/board_core/assets/game_assets";

export type AssetUrl = string;

export type AssetStoreState = {
    assets: Asset[];
    saveChangesFlag: boolean; // Change to this flag triggers save for GameAssets class
};

const initialState: AssetStoreState = {
    assets: [],
    saveChangesFlag: false,
};

const assetsAtom = atom(initialState);

const assets = atom((get) => {
    return get(assetsAtom).assets;
});

const saveChangesFlag = atom((get) => {
    return get(assetsAtom).saveChangesFlag;
});

const addAsset = atom(null, (_, set, asset: Asset) => {
    set(assetsAtom, (state) => {
        state.assets = [...state.assets, asset];
        state.saveChangesFlag = !state.saveChangesFlag;

        return { ...state };
    });
});

const setAssets = atom(null, (_, set, assets: Asset[]) => {
    set(assetsAtom, (state) => {
        state.assets = [...assets];

        return { ...state };
    });
});

export const assetsAtoms = {
    assetsAtom,
    assets,
    addAsset,
    setAssets,
    saveChangesFlag,
};
