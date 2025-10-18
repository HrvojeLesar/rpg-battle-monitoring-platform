import { DiceIconProps } from "./diceIconProps";

export const IconD6 = ({
    size = 18,
    color = "#000000",
    number = 6,
    numberColor = "#000000",
}: DiceIconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            version="1.1"
            id="svg1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs1" />
            <g id="layer1">
                <rect
                    fill="none"
                    fillOpacity="1"
                    stroke={color}
                    strokeWidth="1.05833"
                    strokeDasharray="none"
                    strokeOpacity="1"
                    id="rect2"
                    height="18"
                    x="0.52916503"
                    y="0.52916503"
                    width="18"
                />
                <text
                    xmlSpace="preserve"
                    fontStyle="normal"
                    fontVariant="normal"
                    fontWeight="normal"
                    fontStretch="normal"
                    fontSize="15.0603"
                    fontFamily="'DejaVu Sans Mono'"
                    writingMode="lr-tb"
                    textAnchor="start"
                    fill={numberColor}
                    fillOpacity="1"
                    stroke="none"
                    strokeWidth="18.8254"
                    strokeDasharray="none"
                    strokeOpacity="1"
                    x="2.9725113"
                    y="17.505802"
                    id="d6-die-text"
                    transform="scale(1.2656473,0.79010953)"
                >
                    <tspan
                        id="tspan2"
                        fill={numberColor}
                        fillOpacity="1"
                        stroke="none"
                        strokeWidth="18.8254"
                        strokeDasharray="none"
                        x="2.9725113"
                        y="17.505802"
                    >
                        {number}
                    </tspan>
                </text>
            </g>
        </svg>
    );
};
