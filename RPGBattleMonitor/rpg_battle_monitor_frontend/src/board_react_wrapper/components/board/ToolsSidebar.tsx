import { ReactNode } from "react";

export type ToolsSidebarProps = {
    children?: ReactNode;
};

export const ToolsSidebar = (props: ToolsSidebarProps) => {
    const { children } = props;

    return <>{children}</>;
};
