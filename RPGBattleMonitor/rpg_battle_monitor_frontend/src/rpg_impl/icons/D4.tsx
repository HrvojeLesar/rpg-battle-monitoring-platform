import { DiceIconProps } from "./diceIconProps";

export const IconD4 = ({
    size = 18,
    color = "#000000",
    number = 4,
    numberColor = "#000000",
}: DiceIconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 139.26187 120.60434"
            version="1.1"
            id="svg1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs1" />
            <g id="layer1" transform="translate(8.5702544e-6,1.0504266e-5)">
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="5.562"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    id="path1"
                    d="m 32.448193,1.0138683 24.944465,43.2050837 -49.888932,-1e-6 z"
                    transform="matrix(2.3396473,0,0,2.3396473,-6.28639,10.641013)"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="5.562"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    id="path1"
                    d="m 32.448193,1.0138683 24.944465,43.2050837 -49.888932,-1e-6 z"
                    transform="matrix(2.3396473,0,0,2.3396473,-6.28639,10.641013)"
                />
                <text
                    xmlSpace="preserve"
                    fontSize="55.9795"
                    fontFamily="'DejaVu Sans Mono'"
                    writingMode="lr-tb"
                    direction="ltr"
                    textAnchor="start"
                    fill={numberColor}
                    fillOpacity="1"
                    stroke="none"
                    strokeWidth="98.0651"
                    strokeDasharray="none"
                    x="51.790127"
                    y="98.31636"
                    id="text1"
                >
                    <tspan id="tspan1" x="51.790127" y="98.31636">
                        {number}
                    </tspan>
                </text>
            </g>
        </svg>
    );
};
