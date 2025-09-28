import {
    AssetUploadResponse,
    uploadAsset,
} from "@/board_react_wrapper/requests/assets";
import {
    Button,
    Flex,
    Image,
    LoadingOverlay,
    Loader,
    Progress,
    Text,
} from "@mantine/core";
import { useFileDialog } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosProgressEvent } from "axios";
import { useCallback, useState } from "react";

export type AssetUploadProps = {
    onSuccess: (response: AssetUploadResponse) => void;
    onError: (error: Error, variables: File, context: unknown) => void;
};

export const AssetUpload = (props: Partial<AssetUploadProps>) => {
    const { onSuccess, onError } = props;

    const [progress, setProgress] = useState(0);

    const fileDialog = useFileDialog({
        multiple: false,
        accept: "image/*",
    });

    const onProgress = useCallback((e: AxiosProgressEvent) => {
        const progress = e.progress;
        if (progress === undefined) {
            return;
        }

        setProgress(Math.round(progress * 100));
    }, []);

    const file = fileDialog.files?.item(0) ?? undefined;

    const uploadAssetMutation = useMutation({
        mutationFn: (file: File) => {
            return uploadAsset(file, onProgress);
        },
        onSuccess: onSuccess,
        onError: onError,
    });

    const preview = () => {
        if (file === undefined) {
            return <></>;
        }

        const src = URL.createObjectURL(file);
        return <Image src={src} width={256} height={256} />;
    };

    const uploadButton = () => {
        if (file === undefined) {
            return <></>;
        }

        return (
            <Button
                onClick={() => {
                    uploadAssetMutation.mutate(file);
                }}
                disabled={uploadAssetMutation.isPending}
            >
                Upload
            </Button>
        );
    };

    const loader = () => {
        return <Loader />;
    };

    const progressBar = () => {
        if (!uploadAssetMutation.isPending || progress <= 0) {
            return <></>;
        }

        return <Progress color="green" value={progress} striped animated />;
    };

    const successText = () => {
        if (uploadAssetMutation.isSuccess) {
            return (
                <Text c="green" fw="bold" style={{ alignSelf: "center" }}>
                    File uploaded
                </Text>
            );
        }

        return <></>;
    };

    const dialogButton = () => {
        return (
            <Button onClick={fileDialog.open}>Choose image to upload</Button>
        );
    };

    const errorText = () => {
        if (
            uploadAssetMutation.isError &&
            uploadAssetMutation.error instanceof AxiosError
        ) {
            return (
                <Text c="red" fw="bold" style={{ alignSelf: "center" }}>
                    {uploadAssetMutation.error.response?.statusText ??
                        uploadAssetMutation.error.message}
                </Text>
            );
        }

        return <></>;
    };

    return (
        <>
            <Flex direction="column" gap="xs">
                <Flex pos="relative" direction="column" gap="xs">
                    <LoadingOverlay
                        visible={uploadAssetMutation.isPending}
                        loaderProps={{ children: loader() }}
                        transitionProps={{
                            duration: 200,
                            transition: "fade",
                            timingFunction: "ease",
                        }}
                    />
                    {preview()}
                    {dialogButton()}
                    {uploadButton()}
                    {progressBar()}
                    {successText()}
                    {errorText()}
                </Flex>
            </Flex>
        </>
    );
};
