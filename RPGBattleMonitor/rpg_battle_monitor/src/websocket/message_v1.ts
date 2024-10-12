import { ValueOf } from "../typeutils/utils";

export enum MESSAGE_VERSION {
    V1 = "V1",
}

export enum V1_MESSAGE_SUBTYPES {
    POSITION = "POSITION",
}

export type V1_MESSAGE = {
    POSITION: {
        type: V1_MESSAGE_SUBTYPES.POSITION;
        payload: PositionPayloadV1;
    };
};

export type PositionPayloadV1 = {
    x: number;
    y: number;
};

export type Message = {
    version: MESSAGE_VERSION;
    message: ValueOf<V1_MESSAGE>;
};
