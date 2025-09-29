import {
    Box,
    Popover,
    PopoverDropdownProps,
    PopoverProps,
    PopoverTargetProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode } from "react";

export type AssetHoverPreviewProps = {
    target: ReactNode;
    dropdown: ReactNode;
    popoverProps?: PopoverProps;
    popoverTargetProps?: PopoverTargetProps;
    popoverDropdownProps?: PopoverDropdownProps;
};

export const AssetHoverPreview = (props: AssetHoverPreviewProps) => {
    const {
        target,
        dropdown,
        popoverProps,
        popoverTargetProps,
        popoverDropdownProps,
    } = props;

    const [opened, { close, open }] = useDisclosure(false);

    return (
        <Popover opened={opened} {...popoverProps}>
            <Popover.Target {...popoverTargetProps}>
                <Box onMouseEnter={open} onMouseLeave={close}>
                    {target}
                </Box>
            </Popover.Target>
            <Popover.Dropdown {...popoverDropdownProps}>
                {dropdown}
            </Popover.Dropdown>
        </Popover>
    );
};

export type AssetHoverPreviewDefaultProps = {
    target: ReactNode;
    dropdown: ReactNode;
};

export const AssetHoverPreviewDefault = (
    props: AssetHoverPreviewDefaultProps,
) => {
    const { target, dropdown } = props;

    return (
        <AssetHoverPreview
            popoverProps={{
                position: "left",
                withArrow: true,
            }}
            target={target}
            dropdown={dropdown}
            popoverDropdownProps={{
                style: { pointerEvents: "all" },
            }}
        />
    );
};
