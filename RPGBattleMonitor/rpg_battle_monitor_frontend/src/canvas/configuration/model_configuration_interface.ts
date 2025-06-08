enum Types {
    Number = "number",
}

type NumberOption = {
    type: Types.Number;
    field: string;
    value: number;
};

type OptionsCollection = {
    number: NumberOption;
};

export type ConfigurationOptions = {
    [K in keyof OptionsCollection]: [OptionsCollection[K]];
};

export interface IModelConfiguration {
    getConfiguration(): ConfigurationOptions[];
}
