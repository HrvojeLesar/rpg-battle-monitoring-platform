import { WindowEntry } from "@/board_react_wrapper/stores/window_store";
import { DecorationTokenData } from "@/rpg_impl/tokens/decoration_token_data";
import { AssetPicker } from "../Assets/AssetPicker";
import {
    Button,
    Stack,
    Image,
    Popover,
    TextInput,
    Flex,
    ActionIcon,
    Fieldset,
} from "@mantine/core";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { Asset } from "@/board_core/assets/game_assets";
import { IconCancel, IconDeviceFloppy } from "@tabler/icons-react";
import { queueEntityUpdate } from "@/websocket/websocket";
import { GDragAndDropRegistry } from "@/board_core/registry/drag_and_drop_registry";
import { RPG_ASSET_DROP } from "@/rpg_impl/utils/rpg_token_drop";

export const DECORATION_TOKEN_WINDOW_PREFIX = "decoration-token-";

export const getDecorationTokenWindowName = (
    token: DecorationTokenData,
): string => {
    return `${DECORATION_TOKEN_WINDOW_PREFIX}${token.getUId()}`;
};

export const openDecorationTokenWindow = (
    token: DecorationTokenData,
): WindowEntry => {
    const partialTitle = token.asset
        ? `- ${token.asset?.originalFilename}`
        : "";
    return {
        title: `Decoration Token ${partialTitle}`,
        content: <DecorationTokenWindow token={token} />,
        name: getDecorationTokenWindowName(token),
    };
};

export type DecorationTokenWindowProps = {
    token: DecorationTokenData;
};

export const DecorationTokenWindow = (props: DecorationTokenWindowProps) => {
    const { token } = props;

    const [opened, { close, open }] = useDisclosure(false);
    const [asset, setAsset] = useState(token.asset);

    const [searchTerm, setSearchTerm] = useState("");

    const assetPickerFilter = (asset: Asset) => {
        if (searchTerm.trim().length === 0) {
            return true;
        }

        return asset.originalFilename
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    };

    useEffect(() => {
        setAsset(token.asset);
    }, [token.asset]);

    const isAssetChanged = asset !== token.asset;

    return (
        <Stack gap="xs" pb="xs" justify="center" align="stretch">
            <Fieldset legend="Image">
                <Flex justify="center" align="center">
                    <Image
                        maw="512px"
                        mah="512px"
                        src={getUrl(asset?.url ?? "")}
                        style={{
                            alignSelf: "center",
                        }}
                        draggable
                        onDragStart={(e) => {
                            GDragAndDropRegistry.emit(
                                e as unknown as DragEvent,
                                RPG_ASSET_DROP,
                                JSON.stringify(token.asset),
                            );
                        }}
                    />
                </Flex>
            </Fieldset>
            <Fieldset legend="Edit">
                <Stack gap="xs" pb="xs" justify="center" align="stretch">
                    <Popover
                        opened={opened}
                        withArrow
                        onDismiss={close}
                        width="target"
                        middlewares={{ size: true }}
                    >
                        <Popover.Target>
                            <Button
                                onClick={() => {
                                    if (opened) {
                                        close();
                                    } else {
                                        open();
                                    }
                                }}
                            >
                                Change image
                            </Button>
                        </Popover.Target>
                        <Popover.Dropdown style={{ overflow: "auto" }}>
                            <TextInput
                                mb="xs"
                                value={searchTerm}
                                label="Search"
                                onChange={(event) => {
                                    const value = event.currentTarget.value;
                                    setSearchTerm(value);
                                }}
                                pos="sticky"
                                top="0px"
                            />
                            <AssetPicker
                                onSelect={(asset) => {
                                    setAsset(asset);
                                    close();
                                }}
                                filter={assetPickerFilter}
                            />
                        </Popover.Dropdown>
                    </Popover>
                    {isAssetChanged && (
                        <Flex justify="space-between">
                            <ActionIcon
                                title="Save"
                                color="green"
                                variant="outline"
                                onClick={() => {
                                    if (asset) {
                                        setAsset(asset);
                                        queueEntityUpdate(() => {
                                            token.asset = asset;

                                            return token;
                                        });
                                    }
                                }}
                            >
                                <IconDeviceFloppy />
                            </ActionIcon>
                            <ActionIcon
                                title="Cancel and restore"
                                color="red"
                                variant="outline"
                                onClick={() => {
                                    setAsset(token.asset);
                                }}
                            >
                                <IconCancel />
                            </ActionIcon>
                        </Flex>
                    )}
                </Stack>
            </Fieldset>
        </Stack>
    );
};
