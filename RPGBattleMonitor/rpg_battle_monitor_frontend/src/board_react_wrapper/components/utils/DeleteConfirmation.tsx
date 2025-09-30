import { ActionIcon, Button, Flex, Popover, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { ReactNode, useState } from "react";

export type DeleteConfirmationProps = {
    onDelete: () => void;
    title: string;
    confirmText?: string;
    // TODO: add on click to target
    target?: ReactNode;
};

export const DeleteConfirmation = (props: DeleteConfirmationProps) => {
    const { onDelete, confirmText, title, target } = props;

    const [opened, setOpened] = useState(false);

    return (
        <Popover withArrow shadow="xs" opened={opened} onChange={setOpened}>
            <Popover.Target>
                {target ?? (
                    <ActionIcon
                        onClick={() => setOpened((o) => !o)}
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
                        onClick={() => {
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
