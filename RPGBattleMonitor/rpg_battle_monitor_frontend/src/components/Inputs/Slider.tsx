import type { InputNumberProps } from "antd";
import { Col, InputNumber, Row, Slider as AntDSlider, Typography } from "antd";

type SliderProps = {
    inputValue: number;
    setInputValue: InputNumberProps["onChange"];
    min?: number;
    max?: number;
    label?: string;
};

export const Slider = (props: SliderProps) => {
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
                <AntDSlider
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
