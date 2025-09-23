import { turnOrderAtoms } from "@/rpg_impl/stores/turn_order_store";
import { useAtomValue } from "jotai";

export const TurnOrder = () => {
    const currentTurnOrder = useAtomValue(turnOrderAtoms.currentTurnOrder);

    return <div>{currentTurnOrder?.getUId() ?? "No turn order"}</div>;
};
