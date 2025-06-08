import { useState } from "react";
import type { InputNumberProps } from "antd";
import { Col, InputNumber, Row, Slider as AntDSlider } from "antd";

export const Slider = () => {
    const [inputValue, setInputValue] = useState(1);

    const onChange: InputNumberProps["onChange"] = (newValue) => {
        setInputValue(newValue as number);
    };

    return (
        <Row>
            <Col span={12}>
                <AntDSlider
                    min={1}
                    max={20}
                    onChange={onChange}
                    value={typeof inputValue === "number" ? inputValue : 0}
                />
            </Col>
            <Col span={4}>
                <InputNumber
                    min={1}
                    max={20}
                    style={{ margin: "0 16px" }}
                    value={inputValue}
                    onChange={onChange}
                />
            </Col>
        </Row>
    );
};
