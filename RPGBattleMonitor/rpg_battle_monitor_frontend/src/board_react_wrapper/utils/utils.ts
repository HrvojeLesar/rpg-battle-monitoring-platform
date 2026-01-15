import { connectionStore } from "../stores/connection_store";
import { GAtomStore } from "../stores/state_store";

export const getBaseUrl = (): string => {
    return (
        GAtomStore.get(connectionStore.getConnectionInfo)?.baseUrl ??
        import.meta.env.VITE_BASE_URL ??
        "localhost:3000"
    );
};

export const assetsUrlBase = () => {
    return `${location.protocol}//${getBaseUrl()}`;
};

export const getUrl = (path: string) => {
    return `${assetsUrlBase()}${path}`;
};

export const getAxiosBaseUrl = () => {
    const baseUrl = GAtomStore.get(connectionStore.getConnectionInfo)?.baseUrl
        ? `${location.protocol}//${GAtomStore.get(connectionStore.getConnectionInfo)?.baseUrl}/api`
        : undefined;

    return (
        GAtomStore.get(connectionStore.getConnectionInfo)?.axiosBaseUrl ??
        baseUrl ??
        import.meta.env.VITE_AXIOS_BASE_URL ??
        "http://localhost:3000/api"
    );
};
