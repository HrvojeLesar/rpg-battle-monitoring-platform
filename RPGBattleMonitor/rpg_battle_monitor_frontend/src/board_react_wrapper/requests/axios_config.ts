import axios from "axios";
import { getAxiosBaseUrl } from "../utils/utils";
import { GAtomStore } from "../stores/state_store";
import { connectionStore } from "../stores/connection_store";

export let axiosInstance = axios.create({
    baseURL: getAxiosBaseUrl(),
});

export const setAxiosBaseUrl = (baseUrl: string) => {
    axiosInstance = axios.create({
        baseURL: baseUrl,
    });
};

export enum GameGetRequests {
    GameList = "/game/list",
}

export enum GamePostRequests {
    GameCreate = "/game/create",
}

export enum AssetPostRequests {
    AssetUpload = "/assets/upload",
}

GAtomStore.sub(connectionStore.getConnectionInfo, () => {
    setAxiosBaseUrl(getAxiosBaseUrl());
});
