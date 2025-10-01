import { WindowEntry } from "@/board_react_wrapper/stores/window_store";
import { DecorationTokenData } from "@/rpg_impl/tokens/decoration_token_data";

export const openDecorationTokenWindow = (
    token: DecorationTokenData,
): WindowEntry => {
    const partialTitle = token.asset
        ? `- ${token.asset?.originalFilename}`
        : "";
    return {
        title: `Decoration Token ${partialTitle}`,
        content: <div>Decoration Token</div>,
        name: `decoration-token-${token.getUId()}`,
    };
};
