import { atom } from "jotai";
import { Asset } from "@/board_core/assets/game_assets";
import { GBoard } from "@/board_core/board";
import { isPubliclyVisible } from "@/board_core/utils/visible_to_users";

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
    const assets = get(assetsAtom).assets;
    if (!GBoard.isDm) {
        return assets.filter(
            (a) =>
                isPubliclyVisible(a.visibleToUsers) ||
                a.creator === GBoard.whoAmI,
        );
    }

    return assets;
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

const removeAsset = atom(null, (_, set, asset: Asset) => {
    set(assetsAtom, (state) => {
        state.assets = state.assets.filter((a) => a.url !== asset.url);
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

const save = atom(null, (_, set) => {
    set(assetsAtom, (state) => {
        state.saveChangesFlag = !state.saveChangesFlag;

        return { ...state };
    });
});

export const assetsAtoms = {
    assetsAtom,
    assets,
    addAsset,
    setAssets,
    saveChangesFlag,
    removeAsset,
    save,
};
