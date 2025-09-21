import { tokenAtoms } from "@/board_react_wrapper/stores/token_store";
import { Flex } from "@mantine/core";
import { IconToiletPaper } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { DeleteConfirmation } from "../utils/DeleteConfirmation";

export const Tokens = () => {
    const tokens = useAtomValue(tokenAtoms.tokens);

    const deleteToken = useSetAtom(tokenAtoms.deleteToken);

    return (
        <>
            {tokens.map((token, idx) => (
                <Flex key={idx} gap="xs">
                    <div>{token.getUId()}</div>
                    <DeleteConfirmation
                        title="Delete token"
                        onDelete={() => {
                            deleteToken(token);
                        }}
                    />
                </Flex>
            ))}
        </>
    );
};

export const TokenIcon = () => {
    return <IconToiletPaper size={20} />;
};
