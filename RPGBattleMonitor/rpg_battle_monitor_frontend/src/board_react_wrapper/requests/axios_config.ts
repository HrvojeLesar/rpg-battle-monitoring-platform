import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_AXIOS_BASE_URL ?? "http://localhost:3000/api",
    // withCredentials: true,
});

export enum GameGetRequests {
    GameList = "/game/list",
}

export enum GamePostRequests {
    GameCreate = "/game/create",
}

export enum AssetPostRequests {
    AssetUpload = "/assets/upload",
}
