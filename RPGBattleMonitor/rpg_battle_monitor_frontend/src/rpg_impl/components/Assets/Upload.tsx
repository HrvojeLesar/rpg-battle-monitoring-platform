import { Asset } from "@/board_core/assets/game_assets";
import { GBoard } from "@/board_core/board";
import {
    AssetUpload,
    AssetUploadProps,
} from "@/board_react_wrapper/components/assets/AssetUpload";
import { DeleteConfirmation } from "@/board_react_wrapper/components/utils/DeleteConfirmation";
import { assetsAtoms } from "@/board_react_wrapper/stores/asset_store";
import {
    windowAtoms,
    WindowEntry,
} from "@/board_react_wrapper/stores/window_store";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { Button, Fieldset, Flex, Image, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useAtomValue, useSetAtom } from "jotai";

const assetUploadWindow = (props?: Partial<AssetUploadProps>): WindowEntry => {
    return {
        title: "Asset Upload",
        content: <AssetUpload {...props} />,
        name: "asset-upload",
    };
};

export const RPGAssetUpload = () => {
    const assets = useAtomValue(assetsAtoms.assets);

    const openWindow = useSetAtom(windowAtoms.openWindow);
    const onSuccess = (asset: Asset) => {
        GBoard.assetsRegistry.add(asset);
    };

    return (
        <Flex direction="column" gap="xs">
            <Fieldset legend="Upload">
                <Flex direction="column" gap="xs">
                    <Button
                        onClick={() => {
                            openWindow(
                                assetUploadWindow({ onSuccess: onSuccess }),
                            );
                        }}
                    >
                        Open upload window
                    </Button>
                </Flex>
            </Fieldset>
            <Fieldset legend="Asset list" style={{ overflow: "auto" }}>
                <Flex direction="column" gap="xs">
                    {assets.map((asset, idx) => {
                        return (
                            <Flex direction="row" gap="xs" key={idx}>
                                <Image
                                    src={getUrl(asset.url)}
                                    fit="contain"
                                    width={64}
                                    height={64}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        modals.open({
                                            centered: true,
                                            children: (
                                                <Image
                                                    src={getUrl(asset.url)}
                                                />
                                            ),
                                        });
                                    }}
                                />
                                <Text>{asset.filename}</Text>
                                <DeleteConfirmation
                                    title="Delete asset"
                                    onDelete={() => {
                                        GBoard.assetsRegistry.remove(asset);
                                    }}
                                />
                            </Flex>
                        );
                    })}
                </Flex>
            </Fieldset>
        </Flex>
    );
};
