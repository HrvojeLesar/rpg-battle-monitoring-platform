import { GBoard } from "@/board_core/board";
import { AssetUpload } from "@/board_react_wrapper/components/assets/AssetUpload";
import { assetsAtoms } from "@/board_react_wrapper/stores/asset_store";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { Fieldset, Flex, Image } from "@mantine/core";
import { useAtomValue } from "jotai";

export const RPGAssetUpload = () => {
    const assets = useAtomValue(assetsAtoms.assets);

    return (
        <Flex direction="column" gap="xs">
            <Fieldset legend="Upload">
                <AssetUpload
                    onSuccess={(asset) => {
                        GBoard.assetsRegistry.add(asset);
                    }}
                />
            </Fieldset>
            <Fieldset legend="Asset list">
                <Flex direction="column" gap="xs">
                    {assets.map((asset) => {
                        return <Image key={asset.url} src={getUrl(asset.url)} width={64} height={64} />;
                    })}
                </Flex>
            </Fieldset>
        </Flex>
    );
};
