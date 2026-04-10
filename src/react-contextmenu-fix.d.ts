import "react-contextmenu";
import { ReactNode } from "react";

declare module "react-contextmenu" {
    export interface ContextMenuTriggerProps {
        children?: ReactNode;
    }
    export interface ContextMenuProps {
        children?: ReactNode;
    }
    export interface MenuItemProps {
        children?: ReactNode;
    }
    export interface SubMenuProps {
        children?: ReactNode;
    }
}
