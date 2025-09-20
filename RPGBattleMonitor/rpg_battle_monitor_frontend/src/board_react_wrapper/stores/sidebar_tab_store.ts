import { atom } from "jotai";
import { ReactNode } from "react";

export type SidebarTab = {
    value: string;
    icon: () => ReactNode;
    content: Maybe<() => ReactNode>;
    title?: string;
};

type SidebarTabStoreState = {
    tabs: SidebarTab[];
};

const initialState: SidebarTabStoreState = {
    tabs: [],
};

const sidebarTabAtom = atom(initialState);

const tabs = atom((get) => {
    return get(sidebarTabAtom).tabs;
});

const addTab = atom(null, (_, set, tab: SidebarTab) => {
    set(sidebarTabAtom, (state) => {
        state.tabs = [...state.tabs, tab];

        return { ...state };
    });
});

const resetTabs = atom(null, (_, set) => {
    set(sidebarTabAtom, { ...initialState });
});

export const sidebarTabAtoms = {
    sidebarTabAtom,
    tabs,
    addTab,
    resetTabs,
};
