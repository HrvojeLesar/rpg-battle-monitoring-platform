import {
    axiosInstance,
    GameGetRequests,
    GamePostRequests,
} from "./axios_config";

export const fetchGames = async (): Promise<Game[]> => {
    const response = await axiosInstance.get(GameGetRequests.GameList);

    return response.data;
};

export const createGame = async (): Promise<void> => {
    await axiosInstance.post(GamePostRequests.GameCreate);
};
