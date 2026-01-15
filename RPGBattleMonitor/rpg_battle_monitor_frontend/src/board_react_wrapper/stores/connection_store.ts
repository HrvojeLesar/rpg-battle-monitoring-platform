import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type ConnectionStorage = {
    baseUrl: string;
    axiosBaseUrl: string;
    websocketBaseUrl: string;
};

type StoredConnectionInfo = Maybe<Partial<ConnectionStorage>>;

const connectionStoreAtom = atomWithStorage<StoredConnectionInfo>(
    "connectionInfo",
    undefined,
);

const setConnectionInfo = atom(
    null,
    (get, set, connectionInfo: StoredConnectionInfo) => {
        const currentConnectionInfo = get(connectionStoreAtom);

        set(connectionStoreAtom, {
            ...currentConnectionInfo,
            ...connectionInfo,
        });
    },
);

const getConnectionInfo = atom((get) => {
    return get(connectionStoreAtom);
});

export const connectionStore = {
    connectionStoreAtom,
    getConnectionInfo,
    setConnectionInfo,
};
