import { tokenAtoms } from "@/board_react_wrapper/stores/token_store";
import { Flex, Image, Paper } from "@mantine/core";
import { IconToiletPaper } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { DeleteConfirmation } from "../utils/DeleteConfirmation";
import { CharacterTokenData } from "@/rpg_impl/tokens/CharacterTokenData";
import { Fragment } from "react/jsx-runtime";

const defaultImageUrl = "http://localhost:3000/public/rpg/default.jpeg";

export const Tokens = () => {
    const tokens = useAtomValue(tokenAtoms.tokens);

    const deleteToken = useSetAtom(tokenAtoms.deleteToken);

    return (
        <>
            {tokens.map((token, idx) => {
                if (!(token instanceof CharacterTokenData)) {
                    return <Fragment key={idx}></Fragment>;
                }

                return (
                    <Flex key={idx} gap="xs" align="center">
                        <Image
                            maw="128px"
                            mah="128px"
                            src={token.image ?? defaultImageUrl}
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
        </>
    );
};

export const TokenIcon = () => {
    return <IconToiletPaper size={20} />;
};
