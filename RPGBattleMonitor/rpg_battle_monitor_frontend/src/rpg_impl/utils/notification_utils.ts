import { NotificationData, notifications } from "@mantine/notifications";

export const errorNotification = (
    title: string,
    message: string,
): NotificationData => ({
    title,
    message,
    color: "red",
});

export const anotherTokensTurnNotification = () => {
    notifications.show(
        errorNotification("Not token's turn", "It's another tokens turn"),
    );
};
