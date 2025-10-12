import { tokenAtoms } from "@/board_react_wrapper/stores/token_store";
import { Button, Fieldset, Flex, Image, Paper, Text } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { DeleteConfirmation } from "../utils/DeleteConfirmation";
import { RpgTokenData } from "@/rpg_impl/tokens/rpg_token_data";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { GDragAndDropRegistry } from "@/board_core/registry/drag_and_drop_registry";
import {
    RPG_ASSET_DROP,
    RPG_TOKEN_DROP,
} from "@/rpg_impl/utils/rpg_token_drop";
import { DecorationTokenData } from "@/rpg_impl/tokens/decoration_token_data";
import { AssetHoverPreviewDefault } from "../assets/AssetHoverPreview";
import { TokenDataBase } from "@/board_core/token/token_data";
import { GTokenWindowRegistry } from "@/rpg_impl/registry/token_window_registry";
import { TokenDataFactory } from "@/rpg_impl/factories/token_data_factory";
import { IconChess } from "@tabler/icons-react";

export const defaultImageUrl = getUrl("/public/rpg/default.jpeg");

export const Tokens = () => {
    const tokens = useAtomValue(tokenAtoms.tokens);
    const deleteToken = useSetAtom(tokenAtoms.deleteToken);

    const decorationTokens: DecorationTokenData[] = tokens.filter(
        (t) => t instanceof DecorationTokenData,
    );

    const rpgTokens: RpgTokenData[] = tokens.filter(
        (t) => t instanceof RpgTokenData,
    );

    return (
        <Flex direction="column" gap="xs">
            <RpgTokensFieldset tokens={rpgTokens} deleteToken={deleteToken} />
            <DecorationTokensFieldset
                tokens={decorationTokens}
                deleteToken={deleteToken}
            />
        </Flex>
    );
};

export const TokenIcon = () => {
    return <IconChess size={20} />;
};

type DecorationTokensFieldsetProps = {
    tokens: DecorationTokenData[];
    deleteToken: (token: TokenDataBase) => void;
};

const DecorationTokensFieldset = (props: DecorationTokensFieldsetProps) => {
    const { tokens, deleteToken } = props;

    if (tokens.length === 0) {
        return <></>;
    }

    const tokenElements = tokens.map((token, idx) => {
        const imageUrl =
            token.image !== undefined ? getUrl(token.image) : defaultImageUrl;

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
                onClick={() => {
                    GTokenWindowRegistry.openWindow(token);
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

type RpgTokensFieldsetProps = {
    tokens: RpgTokenData[];
    deleteToken: (token: TokenDataBase) => void;
};
const RpgTokensFieldset = (props: RpgTokensFieldsetProps) => {
    const { tokens, deleteToken } = props;

    const tokenElements = tokens.map((token, idx) => {
        const imageUrl =
            token.image !== undefined ? getUrl(token.image) : defaultImageUrl;

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
                style={{ cursor: "pointer" }}
                onClick={() => {
                    GTokenWindowRegistry.openWindow(token);
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
                    dropdown={<Image mah="256px" maw="256px" src={imageUrl} />}
                />
                <Paper>
                    <Text>{`${token.name}`}</Text>
                </Paper>
                <DeleteConfirmation
                    title="Delete token"
                    onDelete={() => {
                        deleteToken(token);
                    }}
                />
            </Flex>
        );
    });

    return (
        <Fieldset legend="Tokens" style={{ overflow: "auto" }}>
            <Flex direction="column" gap="xs">
                <Button
                    onClick={() => {
                        const token = TokenDataFactory.create();
                        GTokenWindowRegistry.openWindow(token);
                    }}
                >
                    Create new token
                </Button>
                {tokenElements}
            </Flex>
        </Fieldset>
    );
};
