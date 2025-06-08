import { useState } from "react";
import { useApplicationManager } from "../../hooks/bridge_context_hooks";
import { Slider } from "./Slider";
import { InputNumberProps } from "antd";
import { getPositiveNumber } from "../../utils/number_utils";
import { ValueType } from "rc-input-number";

enum GridSide {
    Width = "width",
    Height = "height",
}

type GridSizeHandler =
    | ((value: ValueType | null, side: GridSide) => void)
    | undefined;

export const GridSlider = () => {
    const grid = useApplicationManager().grid;

    const [cellSize, setCellSize] = useState(grid.cellSize);
    const [gridSize, setGridSize] = useState(grid.size);

    const setCellSizeHandler: InputNumberProps["onChange"] = (cellSize) => {
        cellSize = getPositiveNumber(cellSize);
        if (!cellSize) {
            return;
        }

        grid.cellSize = cellSize;
        setCellSize(cellSize);
    };

    const setGridSizeHandler: GridSizeHandler = (size, side) => {
        size = getPositiveNumber(size);
        if (!size) {
            return;
        }

        let currentSize = grid.size;

        if (side === GridSide.Width) {
            currentSize.width = size;
        } else {
            currentSize.height = size;
        }

        grid.size = currentSize;
        setGridSize({ ...currentSize });
    };

    return (
        <>
            <Slider
                label="Cell size in pixels:"
                inputValue={cellSize}
                setInputValue={setCellSizeHandler}
                max={200}
            />
            <Slider
                label="Width"
                inputValue={gridSize.width}
                setInputValue={(event) => {
                    setGridSizeHandler(event, GridSide.Width);
                }}
                max={3000}
            />
            <Slider
                label="Height"
                inputValue={gridSize.height}
                setInputValue={(event) => {
                    setGridSizeHandler(event, GridSide.Height);
                }}
                max={3000}
            />
        </>
    );
};
