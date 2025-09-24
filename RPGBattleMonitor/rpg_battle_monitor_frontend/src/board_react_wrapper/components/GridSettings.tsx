import { useEffect, useState } from "react";
import { Grid } from "../../board_core/grid/grid";
import { queueEntityUpdate } from "../../websocket/websocket";
import {
    NumberInput,
    Slider,
    Text,
    Grid as MantineGrid,
    Flex,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";

enum GridSide {
    Width = "width",
    Height = "height",
}

type SliderProps = {
    inputValue: number;
    setInputValue: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
};

export const GridSettingSlider = (props: SliderProps) => {
    const { inputValue, setInputValue, min, max, label } = {
        min: 1,
        max: 100,
        ...props,
    };

    return (
        <MantineGrid>
            <MantineGrid.Col span={2}>
                <Text>{label}</Text>
            </MantineGrid.Col>
            <MantineGrid.Col span={4}>
                <Slider
                    min={min}
                    max={max}
                    onChange={setInputValue}
                    value={typeof inputValue === "number" ? inputValue : 0}
                />
            </MantineGrid.Col>
            <MantineGrid.Col span={4}>
                <NumberInput
                    allowDecimal={false}
                    allowNegative={false}
                    min={min}
                    max={max}
                    value={inputValue}
                    onChange={(value) => {
                        if (typeof value !== "number") {
                            setInputValue(0);
                        } else {
                            setInputValue(value);
                        }
                    }}
                />
            </MantineGrid.Col>
        </MantineGrid>
    );
};

type Props = {
    grid: Grid;
};

export const GridSettings = (props: Props) => {
    const { grid } = props;
    const [cellSize, setCellSize] = useState(grid.cellSize);
    const [gridSize, setGridSize] = useState(grid.size);

    useEffect(() => {
        setCellSize(grid.cellSize);
        setGridSize(grid.size);
    }, [grid.cellSize, grid.size]);

    const queueGridUpdate = useDebouncedCallback((grid: Grid) => {
        queueEntityUpdate(() => {
            return grid;
        });
    }, 200);

    const setCellSizeHandler = (cellSize: number) => {
        setCellSize(cellSize);
        grid.cellSize = cellSize;

        queueGridUpdate(grid);
    };

    const setGridSizeHandler = (size: number, side: GridSide) => {
        const currentSize = grid.size;

        if (side === GridSide.Width) {
            currentSize.width = size;
        } else {
            currentSize.height = size;
        }

        setGridSize({ ...currentSize });
        grid.size = { ...currentSize };
        queueGridUpdate(grid);
    };

    return (
        <Flex direction="column">
            <GridSettingSlider
                label="Cell size in pixels"
                inputValue={cellSize}
                setInputValue={setCellSizeHandler}
                max={500}
            />
            <GridSettingSlider
                label="Horizontal cell number"
                inputValue={Math.round(gridSize.width / cellSize)}
                setInputValue={(value) => {
                    setGridSizeHandler(value * cellSize, GridSide.Width);
                }}
                max={250}
            />
            <GridSettingSlider
                label="Vertical cell number"
                inputValue={Math.round(gridSize.height / cellSize)}
                setInputValue={(value) => {
                    setGridSizeHandler(value * cellSize, GridSide.Height);
                }}
                max={250}
            />
            <GridSettingSlider
                label="Width"
                inputValue={gridSize.width}
                setInputValue={(value) => {
                    setGridSizeHandler(value, GridSide.Width);
                }}
                max={10000}
            />
            <GridSettingSlider
                label="Height"
                inputValue={gridSize.height}
                setInputValue={(value) => {
                    setGridSizeHandler(value, GridSide.Height);
                }}
                max={10000}
            />
        </Flex>
    );
};
