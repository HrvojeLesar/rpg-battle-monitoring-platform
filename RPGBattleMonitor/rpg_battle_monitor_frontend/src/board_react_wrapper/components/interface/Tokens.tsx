import { tokenAtoms } from "@/board_react_wrapper/stores/token_store";
import { Button, Fieldset, Flex, Image, Paper } from "@mantine/core";
import { IconToiletPaper } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { DeleteConfirmation } from "../utils/DeleteConfirmation";
import { RpgTokenData } from "@/rpg_impl/tokens/rpg_token_data";
import { Fragment } from "react/jsx-runtime";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { queueEntityUpdate } from "@/websocket/websocket";
import { GDragAndDropRegistry } from "@/board_core/registry/drag_and_drop_registry";
import {
    RPG_ASSET_DROP,
    RPG_TOKEN_DROP,
} from "@/rpg_impl/utils/rpg_token_drop";
import { DecorationTokenData } from "@/rpg_impl/tokens/decoration_token_data";
import { AssetHoverPreviewDefault } from "../assets/AssetHoverPreview";

const defaultImageUrl = getUrl("/public/rpg/default.jpeg");

export const Tokens = () => {
    const tokens = useAtomValue(tokenAtoms.tokens);
    const refreshTokens = useSetAtom(tokenAtoms.refreshTokens);
    const deleteToken = useSetAtom(tokenAtoms.deleteToken);

    const decorationTokensFieldset = () => {
        const decorationTokens: DecorationTokenData[] = tokens.filter(
            (t) => t instanceof DecorationTokenData,
        );
        if (decorationTokens.length === 0) {
            return <></>;
        }

        const tokenElements = decorationTokens.map((token, idx) => {
            const imageUrl =
                token.image !== undefined
                    ? getUrl(token.image)
                    : defaultImageUrl;

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
                            JSON.stringify(token.asset),
                        );
                    }}
                >
                    <AssetHoverPreviewDefault
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
                            <Image
                                mah="calc(100vh - (var(--mantine-spacing-xl) * 2))"
                                maw="calc(100vw - (var(--mantine-spacing-xl) * 2))"
                                src={imageUrl}
                            />
                        }
                    />
                    <Paper>{`${token.asset?.originalFilename}`}</Paper>
                    <DeleteConfirmation
                        title="Delete decoration token"
                        onDelete={() => {
                            deleteToken(token);
                        }}
                    />
                </Flex>
            );
        });

        return (
            <Fieldset legend="Decoration tokens" style={{ overflow: "auto" }}>
                <Flex direction="column" gap="xs">
                    {tokenElements}
                </Flex>
            </Fieldset>
        );
    };

    return (
        <Flex direction="column" gap="xs">
            <Button
                onClick={() => {
                    queueEntityUpdate(() => {
                        const token = tokens[0];
                        if (!(token instanceof RpgTokenData)) {
                            return [];
                        }

                        token.image =
                            token.image === "/public/realamerican.jpg"
                                ? "/public/rpg/default.jpeg"
                                : "/public/realamerican.jpg";

                        return token;
                    });
                    refreshTokens();
                }}
            >
                Switch first token icon
            </Button>

            {decorationTokensFieldset()}
            {tokens.map((token, idx) => {
                if (!(token instanceof RpgTokenData)) {
                    return <Fragment key={idx}></Fragment>;
                }

                const imageUrl =
                    token.image !== undefined
                        ? getUrl(token.image)
                        : defaultImageUrl;

                return (
                    <Flex
                        key={idx}
                        gap="xs"
                        align="center"
                        draggable
                        onDragStart={(e) => {
                            GDragAndDropRegistry.emit(
                                e as unknown as DragEvent,
                                RPG_TOKEN_DROP,
                                token.getUId(),
                            );
                        }}
                    >
                        <Image
                            draggable="false"
                            maw="128px"
                            mah="128px"
                            src={imageUrl}
                        />
                        <Paper>{`${token.name} - ${token.getUId()}`}</Paper>
                        <DeleteConfirmation
                            title="Delete token"
                            onDelete={() => {
                                deleteToken(token);
                            }}
                        />
                    </Flex>
                );
            })}
        </Flex>
    );
};

export const TokenIcon = () => {
    return <IconToiletPaper size={20} />;
};
