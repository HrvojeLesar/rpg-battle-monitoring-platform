import { GBoard } from "@/board_core/board";
import { sceneAtoms } from "@/board_react_wrapper/stores/scene_store";
import {
    Button,
    Combobox,
    Flex,
    MantineStyleProp,
    useCombobox,
} from "@mantine/core";
import {
    IconStackBack,
    IconStackFront,
    IconStackMiddle,
} from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { Fragment, ReactNode } from "react";

export type LayerSelectOption = {
    key: string;
    label: string;
    comboboxItem?: ReactNode;
    icon?: ReactNode;
    showToNonDm: boolean;
};

export type LayerSelectProps = {
    comboboxTargetStyle?: MantineStyleProp;
    comboboxOptionsStyle?: MantineStyleProp;
    layers?: LayerSelectOption[];
};

const defaultLayers: LayerSelectOption[] = [
    {
        key: "token",
        label: "Tokens layer",
        comboboxItem: (
            <Flex align="center">
                <IconStackFront />
                Tokens layer
            </Flex>
        ),
        showToNonDm: true,
    },
    {
        key: "grid",
        label: "Grid layer",
        comboboxItem: (
            <Flex align="center">
                <IconStackMiddle />
                Grid layer
            </Flex>
        ),
        showToNonDm: false,
    },
    {
        key: "gridBackground",
        label: "Grid background layer",
        comboboxItem: (
            <Flex align="center">
                <IconStackBack />
                Grid background layer
            </Flex>
        ),
        showToNonDm: false,
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

    const options = layers.map((layer) => {
        if (!GBoard.isDm && !layer.showToNonDm) return <Fragment key={layer.key}></Fragment>;
        return (
            <Combobox.Option value={layer.key} key={layer.key}>
                {layer.comboboxItem ?? layer.label}
            </Combobox.Option>
        );
    });

    const currentLayerName = () => {
        const layerName = currentSceneLayer?.name;
        if (layerName === undefined) {
            return undefined;
        }

        const layer = layers.find((layer) => layer.key === layerName);

        return layer?.comboboxItem ?? layer?.label;
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
                        {currentLayerName()}
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
