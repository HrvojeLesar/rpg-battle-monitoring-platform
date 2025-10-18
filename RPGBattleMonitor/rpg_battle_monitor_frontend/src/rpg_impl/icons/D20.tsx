import { DiceIconProps } from "./diceIconProps";

export const IconD20 = ({
    size = 18,
    color = "#000000",
    number = 20,
    numberColor = "#000000",
}: DiceIconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 70.055313 80.024887"
            version="1.1"
            id="svg1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs1" />
            <g id="layer1">
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4.00243118"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    id="path5"
                    d="m 107.48037,71.718567 -32.859177,18.971256 -32.85918,-18.971256 0,-37.942513 32.85918,-18.971256 32.859177,18.971257 z"
                    transform="matrix(1.0047982,0,0,0.99401603,-39.968499,-12.438559)"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="3.96875"
                    strokeOpacity="1"
                    id="path6"
                    d="m 71.746338,61.989693 15.160856,26.259373 -30.321712,-10e-7 z"
                    transform="translate(-37.148443,-36.020943)"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4.7625"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="m 2.6248661,21.623897 31.9983679,3.12484 v 0 l 33.373295,-3.374828"
                    id="path7"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4.7625"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="M 34.998215,23.873782 34.873221,2.9998469"
                    id="path8"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4.7625"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="M 2.8748532,22.623846 19.873986,52.247334"
                    id="path9"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4.7625"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="m 50.497422,52.997295 16.49916,-30.248456 v 0 l 0.420474,-0.478528"
                    id="path10"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4.7625"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="M 19.623998,52.747309 2.4998724,58.996989"
                    id="path11"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4.7625"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="M 18.749043,51.997347 35.623182,76.871078"
                    id="path12"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4.7625"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="M 50.622416,52.49732 35.748177,76.246108"
                    id="path13"
                />
                <path
                    fill="none"
                    stroke={color}
                    strokeWidth="4.7625"
                    strokeOpacity="1"
                    strokeDasharray="none"
                    d="m 51.372378,52.247334 16.249171,6.24968"
                    id="path14"
                />
                <text
                    xmlSpace="preserve"
                    fontSize="12.5264px"
                    fontFamily="'DejaVu Sans Mono'"
                    writingMode="lr-tb"
                    direction="ltr"
                    textAnchor="start"
                    fill={color}
                    fillOpacity="1"
                    stroke="none"
                    strokeWidth="21.9438"
                    strokeDasharray="none"
                    strokeOpacity="1"
                    x={number < 10 ? "33.124516" : "29.622871"}
                    y="46.256962"
                    id="text14"
                    transform="scale(0.94057989,1.0631739)"
                >
                    <tspan
                        id="tspan14"
                        fill={numberColor}
                        fillOpacity="1"
                        stroke="none"
                        strokeWidth="21.9438"
                        strokeDasharray="none"
                        x={number < 10 ? "33.124516" : "29.622871"}
                        y="46.256962"
                    >
                        {number}
                    </tspan>
                </text>
            </g>
        </svg>
    );
};
