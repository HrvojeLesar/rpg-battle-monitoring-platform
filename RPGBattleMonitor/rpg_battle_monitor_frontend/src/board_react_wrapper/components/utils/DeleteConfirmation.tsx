import { ActionIcon, Button, Flex, Popover, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { cloneElement, ReactElement, useState } from "react";

export type DeleteConfirmationProps = {
    onDelete: () => void;
    title: string;
    confirmText?: string;
    target?: ReactElement;
};

export const DeleteConfirmation = (props: DeleteConfirmationProps) => {
    const { onDelete, confirmText, title, target } = props;

    const [opened, setOpened] = useState(false);

    const clonedTarget = () => {
        if (target === undefined || target === null) {
            return undefined;
        }

        return cloneElement(target, {
            onClick: (e) => {
                if (typeof e.stopPropagation === "function") {
                    e.stopPropagation();
                }
                setOpened((o) => !o);
            },
        });
    };

    return (
        <Popover withArrow shadow="xs" opened={opened} onChange={setOpened}>
            <Popover.Target>
                {clonedTarget() ?? (
                    <ActionIcon
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpened((o) => !o);
                        }}
                        variant="outline"
                        color="red"
                        title={title}
                    >
                        <IconTrash />
                    </ActionIcon>
                )}
            </Popover.Target>
            <Popover.Dropdown>
                <Flex gap="xs" align="center">
                    <Text c="red">{confirmText ?? "Are you sure ?"}</Text>
                    <Button
                        size="xs"
                        color="red"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                            setOpened(false);
                        }}
                    >
                        Yes
                    </Button>
                </Flex>
            </Popover.Dropdown>
        </Popover>
    );
};
