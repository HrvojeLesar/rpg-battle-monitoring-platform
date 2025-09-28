import { AssetUploadResponse } from "@/board_react_wrapper/requests/assets";
import {
    DeleteAction,
    IMessagable,
    shouldApplyChanges,
    TypedJson,
    UId,
} from "../interfaces/messagable";
import newUId from "../utils/uuid_generator";
import { assetsAtoms } from "@/board_react_wrapper/stores/asset_store";
import { GAtomStore } from "@/board_react_wrapper/stores/state_store";
import { queueEntityUpdate } from "@/websocket/websocket";

export type Asset = AssetUploadResponse;

export type GameAssetsAttributes = {
    assets: Asset[];
};

export class GameAssets implements IMessagable<GameAssetsAttributes> {
    private _uid: UId;
    protected _lastChangesTimestamp: Maybe<number> = undefined;
    protected unsub: () => void;

    public constructor(_attributes?: GameAssetsAttributes) {
        this._uid = newUId();

        this.unsub = GAtomStore.sub(assetsAtoms.saveChangesFlag, () => {
            queueEntityUpdate(() => {
                return this;
            });
        });
    }

    public static getKindStatic(): string {
        return this.name;
    }

    public getKind(): string {
        return this.constructor.name;
    }

    public getUId(): UId {
        return this._uid;
    }

    public setUId(uid: UId): void {
        this._uid = uid;
    }

    public toJSON(): TypedJson<GameAssetsAttributes> {
        return {
            ...this.getAttributes(),
            kind: this.getKind(),
            uid: this.getUId(),
            timestamp: Date.now(),
        };
    }

    public getAttributes(): GameAssetsAttributes {
        return {
            assets: this.assets,
        };
    }

    public applyUpdateAction(changes: TypedJson<GameAssetsAttributes>): void {
        this._uid = changes.uid;

        GAtomStore.set(assetsAtoms.setAssets, changes.assets);
    }

    public deleteAction(action: DeleteAction): void {
        action.acc.push(this);

        action.cleanupCallbacks.push(() => {
            this.unsub();
        });
    }

    public getLastChangesTimestamp(): Maybe<number> {
        return this._lastChangesTimestamp;
    }

    public shouldApplyChanges(
        changes: TypedJson<GameAssetsAttributes>,
    ): boolean {
        return shouldApplyChanges(this, changes);
    }

    public add(asset: Asset): void {
        const existingAsset = this.assets.find((a) => a.url === asset.url);
        if (!existingAsset) {
            GAtomStore.set(assetsAtoms.addAsset, asset);
        }
    }

    public get assets(): Asset[] {
        return GAtomStore.get(assetsAtoms.assets);
    }
}
