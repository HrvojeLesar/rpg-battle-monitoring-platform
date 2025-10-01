import { assetsAtoms } from "@/board_react_wrapper/stores/asset_store";
import { WindowEntry } from "@/board_react_wrapper/stores/window_store";
import { DecorationTokenData } from "@/rpg_impl/tokens/decoration_token_data";
import { useAtomValue } from "jotai";
import { AssetPicker } from "../Assets/AssetPicker";
import { Button, Flex, Image, Popover } from "@mantine/core";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { useDisclosure } from "@mantine/hooks";
import { Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";

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

    useEffect(() => {
        setAsset(token.asset);
    }, [token.asset]);

    return (
        <Popover
            opened={opened}
            withArrow
            width="calc(100vw - (var(--mantine-spacing-md) * 2))"
        >
            <Popover.Target>
                <Flex direction="column" gap="xs">
                    <Image
                        maw="512px"
                        mah="512px"
                        src={getUrl(asset?.url ?? "")}
                    />
                    <Button
                        onClick={() => {
                            open();
                        }}
                    >
                        Change image
                    </Button>
                </Flex>
            </Popover.Target>
            <Popover.Dropdown>
                <AssetPicker
                    onSelect={(asset) => {
                        setAsset(asset);
                        close();
                    }}
                />
            </Popover.Dropdown>
        </Popover>
    );
};
