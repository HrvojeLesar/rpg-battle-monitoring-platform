import { useEffect, useState } from "react";
import { Grid } from "../../board_core/grid/grid";
import {
    Slider,
    InputNumberProps,
    Row,
    Col,
    InputNumber,
    Typography,
} from "antd";

import { ValueType } from "rc-input-number";
import { queueEntityUpdate } from "../../websocket/websocket";

enum GridSide {
    Width = "width",
    Height = "height",
}

type SliderProps = {
    inputValue: number;
    setInputValue: InputNumberProps["onChange"];
    min?: number;
    max?: number;
    label?: string;
};

type GridSizeHandler =
    | ((value: ValueType | null, side: GridSide) => void)
    | undefined;

export const MySlider = (props: SliderProps) => {
    const { inputValue, setInputValue, min, max, label } = {
        min: 1,
        max: 100,
        ...props,
    };

    return (
        <Row align="middle">
            <Col>
                <Typography.Text>{label}</Typography.Text>
            </Col>
            <Col span={12}>
                <Slider
                    min={min}
                    max={max}
                    onChange={setInputValue}
                    value={typeof inputValue === "number" ? inputValue : 0}
                />
            </Col>
            <Col span={4}>
                <InputNumber
                    min={min}
                    max={max}
                    style={{ margin: "0 16px" }}
                    value={inputValue}
                    onChange={setInputValue}
                />
            </Col>
        </Row>
    );
};

export function getPositiveNumber(input: ValueType | null): number | null {
    if (input === null) {
        return null;
    }

    if (typeof input === "string") {
        input = parseInt(input);
    }

    if (isNaN(input)) {
        return null;
    }

    if (input <= 0) {
        return null;
    }

    return input;
}

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

    const setCellSizeHandler: InputNumberProps["onChange"] = (cellSize) => {
        cellSize = getPositiveNumber(cellSize);
        if (!cellSize) {
            return;
        }

        queueEntityUpdate(() => {
            grid.cellSize = cellSize;

            return grid;
        });
        setCellSize(cellSize);
    };

    const setGridSizeHandler: GridSizeHandler = (size, side) => {
        size = getPositiveNumber(size);
        if (!size) {
            return;
        }

        const currentSize = grid.size;

        if (side === GridSide.Width) {
            currentSize.width = size;
        } else {
            currentSize.height = size;
        }

        queueEntityUpdate(() => {
            grid.size = { ...currentSize };

            return grid;
        });
        setGridSize({ ...currentSize });
    };

    return (
        <>
            <MySlider
                label="Cell size in pixels:"
                inputValue={cellSize}
                setInputValue={setCellSizeHandler}
                max={500}
            />
            <MySlider
                label="Width"
                inputValue={gridSize.width}
                setInputValue={(event) => {
                    setGridSizeHandler(event, GridSide.Width);
                }}
                max={10000}
            />
            <MySlider
                label="Height"
                inputValue={gridSize.height}
                setInputValue={(event) => {
                    setGridSizeHandler(event, GridSide.Height);
                }}
                max={10000}
            />
        </>
    );
};
