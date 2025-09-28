import { AxiosProgressEvent } from "axios";
import { AssetPostRequests, axiosInstance } from "./axios_config";

export type AssetUploadResponse = {
    url: string;
    filename: string;
    thumbnails: string[];
    originalFilename: string;
};

export const uploadAsset = async (
    file: File,
    onProgress?: (event: AxiosProgressEvent) => void,
): Promise<AssetUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);

    const response = await axiosInstance.post<AssetUploadResponse>(
        AssetPostRequests.AssetUpload,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: onProgress,
        },
    );

    return response.data;
};
