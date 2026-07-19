import type { FC, ReactNode, MouseEvent, ElementType } from "react";
import styles from "./menu.module.css";

export interface MenuProps {
    vertical?: boolean;
    inverted?: boolean;
    size?: "small";
    secondary?: boolean;
    className?: string;
    children?: ReactNode;
}

export interface MenuItemProps {
    as?: ElementType;
    active?: boolean;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    className?: string;
    children?: ReactNode;
}

const MenuRoot: FC<MenuProps> = ({ vertical, inverted, size, secondary, className, children }) => {
    const classNames = [
        styles.menu,
        secondary && styles.secondary,
        size === "small" && styles.small,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return <div className={classNames}>{children}</div>;
};

const Item: FC<MenuItemProps> = ({ as: Tag = "div", active, onClick, className, children }) => {
    const classNames = [
        styles.item,
        active && styles.active,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Tag className={classNames} onClick={onClick}>
            {children}
        </Tag>
    );
};

export const Menu = Object.assign(MenuRoot, {
    Item,
}) as FC<MenuProps> & {
    Item: typeof Item;
};
