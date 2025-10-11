import { GBoard } from "@/board_core/board";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import { Button, Combobox, MantineStyleProp, useCombobox } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { ReactNode } from "react";

export type LayerSelectOption = {
    key: string;
    label: string;
    comboboxItem?: ReactNode;
    icon?: ReactNode;
};

export type LayerSelectProps = {
    comboboxTargetStyle?: MantineStyleProp;
    comboboxOptionsStyle?: MantineStyleProp;
    layers?: LayerSelectOption[];
};

const defaultLayers: LayerSelectOption[] = [
    {
        key: "gridBackground",
        label: "Grid background",
    },
    {
        key: "token",
        label: "Tokens",
    },
    {
        key: "grid",
        label: "Grid",
    },
];

export const LayerSelect = (props: LayerSelectProps) => {
    const { comboboxOptionsStyle, comboboxTargetStyle } = props;
    const layers = props.layers ?? defaultLayers;

    const currentScene = useAtomValue(sceneAtoms.getCurrentScene);
    const currentSceneLayer = useAtomValue(sceneAtoms.getCurrentSceneLayer);
    const refreshScenes = useSetAtom(sceneAtoms.refreshScenes);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const options = layers.map((layer) => (
        <Combobox.Option value={layer.key} key={layer.key}>
            {layer.comboboxItem ?? layer.label}
        </Combobox.Option>
    ));

    const currentLayerName = () => {
        const layerName = currentSceneLayer?.name;
        if (layerName === undefined) {
            return undefined;
        }

        return layers.find((layer) => layer.key === layerName)?.label;
    };

    return (
        currentScene && (
            <Combobox
                store={combobox}
                withArrow
                withinPortal={false}
                onOptionSubmit={(layerName) => {
                    combobox.closeDropdown();
                    GBoard.scene?.selectLayer(layerName);
                    refreshScenes();
                }}
            >
                <Combobox.Target>
                    <Button
                        onClick={() => combobox.toggleDropdown()}
                        style={{
                            ...comboboxTargetStyle,
                            pointerEvents: "all",
                        }}
                    >
                        Switch layer events (Current layer:
                        {currentLayerName()})
                    </Button>
                </Combobox.Target>

                <Combobox.Dropdown
                    style={{
                        ...comboboxOptionsStyle,
                        pointerEvents: "all",
                    }}
                >
                    <Combobox.Options>{options}</Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        )
    );
};
