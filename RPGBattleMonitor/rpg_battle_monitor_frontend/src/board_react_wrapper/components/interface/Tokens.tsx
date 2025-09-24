import { tokenAtoms } from "@/board_react_wrapper/stores/token_store";
import { Button, Flex, Image, Paper } from "@mantine/core";
import { IconToiletPaper } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { DeleteConfirmation } from "../utils/DeleteConfirmation";
import { RpgTokenData } from "@/rpg_impl/tokens/rpg_token_data";
import { Fragment } from "react/jsx-runtime";
import { getUrl } from "@/board_react_wrapper/utils/utils";
import { queueEntityUpdate } from "@/websocket/websocket";

const defaultImageUrl = getUrl("/public/rpg/default.jpeg");

export const Tokens = () => {
    const tokens = useAtomValue(tokenAtoms.tokens);
    const refreshTokens = useSetAtom(tokenAtoms.refreshTokens);
    const deleteToken = useSetAtom(tokenAtoms.deleteToken);

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
                            // WARN: format must be "text/plain" because mobile implementations do not broadly support other formats
                            e.dataTransfer.setData(
                                "text/plain",
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
