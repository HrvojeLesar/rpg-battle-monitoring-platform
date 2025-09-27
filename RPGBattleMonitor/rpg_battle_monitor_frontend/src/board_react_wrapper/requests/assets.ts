import { AxiosProgressEvent } from "axios";
import { AssetPostRequests, axiosInstance } from "./axios_config";

export const uploadAsset = async (
    file: File,
    onProgress?: (event: AxiosProgressEvent) => void,
): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);

    await axiosInstance.post(AssetPostRequests.AssetUpload, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress: onProgress,
    });
};
