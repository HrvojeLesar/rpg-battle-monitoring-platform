import { Asset } from "@/board_core/assets/game_assets";
import { DeleteAction, TypedJson } from "@/board_core/interfaces/messagable";
import {
    TokenDataBase,
    TokenDataBaseAttributes,
} from "@/board_core/token/token_data";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { windowAtoms } from "@/board_react_wrapper/stores/window_store";
import { getDecorationTokenWindowName } from "../components/windows/DecorationTokenWindow";

export type DecorationTokenDataAttributes = {
    asset?: Asset;
} & TokenDataBaseAttributes;

export class DecorationTokenData extends TokenDataBase<DecorationTokenDataAttributes> {
    protected _asset: Maybe<Asset>;

    public constructor(attributes?: DecorationTokenDataAttributes) {
        super(attributes);

        this._asset = attributes?.asset;
    }

    public getAttributes(): DecorationTokenDataAttributes {
        return {
            ...super.getAttributes(),
            asset: this._asset,
        };
    }

    public applyUpdateAction(
        changes: TypedJson<DecorationTokenDataAttributes>,
    ): void {
        this._asset = changes.asset;

        super.applyUpdateAction({
            ...changes,
            image: changes.asset?.url,
        });
    }

    public set asset(asset: Asset) {
        this._asset = asset;
        this.image = asset.url;
    }

    public get asset(): Maybe<Asset> {
        return this._asset;
    }

    public deleteAction(action: DeleteAction): void {
        super.deleteAction(action);

        action.cleanupCallbacks.push(() => {
            GAtomStore.set(
                windowAtoms.closeWindow,
                getDecorationTokenWindowName(this),
            );
        });
    }
}
