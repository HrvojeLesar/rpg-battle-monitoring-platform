import { DiceIconProps } from "./diceIconProps";

export const IconD12 = ({
    size = 18,
    color = "#000000",
    number = 12,
    numberColor = "#000000",
}: DiceIconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 71.930267 75.601852"
            version="1.1"
            id="svg1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs1" />
            <g id="layer1">
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="2.4862"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    id="path2"
                    d="M 14.020669,35.855316 4.8448586,25.664546 3.4114563,12.026634 10.267973,0.1507986 22.795452,-5.4267946 36.208823,-2.5756947 45.384634,7.6150751 46.818036,21.252987 39.961519,33.128823 27.43404,38.706416 Z"
                    transform="matrix(1.6002694,0.16621261,-0.16621261,1.6002694,-1.4594795,6.9983609)"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    id="path3"
                    d="M 53.369204,36.945177 42.84916,64.350827 13.533966,62.814483 5.9362226,34.45932 30.555754,18.471209 Z"
                    transform="matrix(0.65122694,-0.03368613,0.03368613,0.65122694,15.018371,10.827837)"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="m 1.1368815,26.251627 19.3269855,7.234701 v 0 l -0.103353,-0.103352"
                    id="path4"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="M 35.553385,22.427571 35.863445,2.3771159"
                    id="path5"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="M 57.877603,67.07601 45.268554,51.26302"
                    id="path7"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="M 26.148274,51.366374 15.606282,66.76595"
                    id="path8"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="M 50.746257,33.072916 70.073241,26.665039"
                    id="path9"
                />
                <text
                    xmlSpace="preserve"
                    fontSize="18.1758"
                    fontFamily="'DejaVu Sans Mono'"
                    writingMode="lr-tb"
                    direction="ltr"
                    textAnchor="start"
                    fill={numberColor}
                    fillOpacity="1"
                    stroke="none"
                    strokeWidth="22.8987"
                    strokeDasharray="none"
                    x={number < 10 ? "30.062868" : "24.688519"}
                    y="45.033157"
                    id="text9"
                >
                    <tspan
                        id="tspan9"
                        x={number < 10 ? "30.062868" : "24.688519"}
                        y="45.033157"
                    >
                        {number}
                    </tspan>
                </text>
            </g>
        </svg>
    );
};
