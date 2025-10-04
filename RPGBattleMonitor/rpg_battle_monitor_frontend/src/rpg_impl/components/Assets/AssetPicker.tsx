import { Asset } from "@/board_core/assets/game_assets";
import { AssetHoverPreviewDefault } from "@/board_react_wrapper/components/assets/AssetHoverPreview";
import { assetsAtoms } from "@/board_react_wrapper/stores/asset_store";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import {
    Image,
    Stack,
    Text,
    Group,
    Popover,
    Button,
    TextInput,
} from "@mantine/core";
import { useAtomValue } from "jotai";
import classes from "../../css/AssetPicker.module.css";

export type AssetPickerProps = {
    filter?: (asset: Asset) => boolean;
    onSelect: (asset: Asset) => void;
};

export const AssetPicker = (props: AssetPickerProps) => {
    const { filter, onSelect } = props;

    const assets = useAtomValue(assetsAtoms.assets).filter(
        filter ?? (() => true),
    );

    return (
        <Group grow wrap="wrap" justify="center">
            {assets.map((asset, idx) => {
                const imageUrl = getUrl(asset.url);
                return (
                    <Stack
                        key={idx}
                        style={{ cursor: "pointer" }}
                        className={classes["asset-selection"]}
                        onClick={() => onSelect(asset)}
                        p="xs"
                        align="center"
                        justify="center"
                        miw="256px"
                        mih="256px"
                    >
                        <AssetHoverPreviewDefault
                            position="top"
                            target={
                                <Image
                                    draggable="false"
                                    maw="128px"
                                    mah="128px"
                                    miw="32px"
                                    mih="32px"
                                    src={imageUrl}
                                />
                            }
                            dropdown={
                                <Image mah="512px" maw="512px" src={imageUrl} />
                            }
                        />
                        <Text fw="bold">{asset.originalFilename}</Text>
                    </Stack>
                );
            })}
        </Group>
    );
};

export type DefaultAssetPickerProps = {
    filter: (asset: Asset) => boolean;
    onSelect: (asset: Asset) => void;
    searchTerm: string;
    onSearchChange: (searchTerm: string) => void;
    opened: boolean;
    open: () => void;
    close: () => void;
};

export const DefaultAssetPicker = (props: DefaultAssetPickerProps) => {
    const {
        filter,
        onSelect,
        searchTerm,
        onSearchChange,
        opened,
        open,
        close,
    } = props;

    return (
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
                        onSearchChange(value);
                    }}
                    pos="sticky"
                    top="0px"
                />
                <AssetPicker onSelect={onSelect} filter={filter} />
            </Popover.Dropdown>
        </Popover>
    );
};
