import { DiceIconProps } from "./diceIconProps";

export const IconD8 = ({
    size = 18,
    color = "#000000",
    number = 8,
    numberColor = "#000000",
}: DiceIconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 102.76786 102.76787"
            version="1.1"
            id="svg1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs1" />
            <g id="layer1">
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="5.56199"
                    strokeOpacity="1"
                    id="path1"
                    d="M 97.473797,29.145508 50.022785,76.596519 2.5717735,29.145508 50.022785,-18.305504 Z"
                    transform="translate(1.3611472,22.238425)"
                />
                <text
                    xmlSpace="preserve"
                    fontSize="44.1692"
                    fontFamily="'DejaVu Sans Mono'"
                    writingMode="lr-tb"
                    direction="ltr"
                    textAnchor="start"
                    fill={numberColor}
                    fillOpacity="1"
                    stroke="none"
                    strokeWidth="77.3758"
                    strokeDasharray="none"
                    x="37.277531"
                    y="69.291565"
                    id="text1"
                >
                    <tspan id="tspan1" x="37.277531" y="69.291565">
                        {number}
                    </tspan>
                </text>
            </g>
        </svg>
    );
};
