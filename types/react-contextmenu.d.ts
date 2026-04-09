import { ReactNode } from "react";

declare module "react-contextmenu" {
    export interface ContextMenuProps {
        children?: ReactNode;
    }

    export interface MenuItemProps {
        children?: ReactNode;
    }

    export interface ContextMenuTriggerProps {
        children?: ReactNode;
    }
}
