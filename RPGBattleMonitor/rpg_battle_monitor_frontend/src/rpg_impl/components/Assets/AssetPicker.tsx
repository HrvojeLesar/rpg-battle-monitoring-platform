import { Asset } from "@/board_core/assets/game_assets";
import { AssetHoverPreviewDefault } from "@/board_react_wrapper/components/assets/AssetHoverPreview";
import { assetsAtoms } from "@/board_react_wrapper/stores/asset_store";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { Image, Flex, Text } from "@mantine/core";
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
        <Flex direction="row" gap="xs" wrap="wrap">
            {assets.map((asset, idx) => {
                const imageUrl = getUrl(asset.url);
                return (
                    <Flex
                        key={idx}
                        direction={"column"}
                        style={{ cursor: "pointer" }}
                        className={classes["asset-selection"]}
                        onClick={() => onSelect(asset)}
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
                                <Image mah="256px" maw="256px" src={imageUrl} />
                            }
                        />
                        <Text fw="bold">{asset.originalFilename}</Text>
                    </Flex>
                );
            })}
        </Flex>
    );
};
