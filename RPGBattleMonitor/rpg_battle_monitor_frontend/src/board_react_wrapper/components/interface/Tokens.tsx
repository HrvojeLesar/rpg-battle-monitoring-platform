import { tokenAtoms } from "@/board_react_wrapper/stores/token_store";
import { IconToiletPaper } from "@tabler/icons-react";
import { useAtomValue } from "jotai";

export const Tokens = () => {
    const tokens = useAtomValue(tokenAtoms.tokens);

    return (
        <>
            {tokens.map((token, idx) => (
                <div key={idx}>{token.getUId()}</div>
            ))}
        </>
    );
};

export const TokenIcon = () => {
    return <IconToiletPaper size={20} />;
};
