import { Asset } from "@/board_core/assets/game_assets";
import { GBoard } from "@/board_core/board";
import { GDragAndDropRegistry } from "@/board_core/registry/drag_and_drop_registry";
import { AssetHoverPreviewDefault } from "@/board_react_wrapper/components/assets/AssetHoverPreview";
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
import { RPG_ASSET_DROP } from "@/rpg_impl/utils/rpg_token_drop";
import { Button, Fieldset, Flex, Image, Paper, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconFileAnalytics } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";

const assetUploadWindow = (props?: Partial<AssetUploadProps>): WindowEntry => {
    return {
        title: "Asset Upload",
        content: <AssetUpload {...props} />,
        name: "asset-upload",
    };
};

export const AssetIcon = () => {
    return <IconFileAnalytics />;
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
                            <Flex
                                key={idx}
                                gap="xs"
                                align="center"
                                draggable
                                onDragStart={(e) => {
                                    GDragAndDropRegistry.emit(
                                        e as unknown as DragEvent,
                                        RPG_ASSET_DROP,
                                        JSON.stringify(asset),
                                    );
                                }}
                            >
                                <AssetHoverPreviewDefault
                                    target={
                                        <Image
                                            src={getUrl(asset.url)}
                                            maw="32px"
                                            mah="32px"
                                            miw="32px"
                                            mih="32px"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => {
                                                modals.open({
                                                    title: "Image preview",
                                                    centered: true,
                                                    children: (
                                                        <Image
                                                            src={getUrl(
                                                                asset.url,
                                                            )}
                                                        />
                                                    ),
                                                });
                                            }}
                                        />
                                    }
                                    dropdown={
                                        <Image
                                            mah="calc(100vh - (var(--mantine-spacing-xl) * 2))"
                                            maw="calc(100vw - (var(--mantine-spacing-xl) * 2))"
                                            src={getUrl(asset.url)}
                                        />
                                    }
                                />
                                <Paper>
                                    <Text>{asset.originalFilename}</Text>
                                </Paper>
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
