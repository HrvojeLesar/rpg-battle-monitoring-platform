export type VisibleToUsers = string[];

export function isPubliclyVisible(visibleToUsers: VisibleToUsers) {
    return visibleToUsers.includes("*");
}
