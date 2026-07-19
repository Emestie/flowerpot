import type { FC, ReactNode } from "react";
import groupStyles from "./button-group.module.css";

export interface ButtonGroupProps {
    size?: "mini" | "tiny" | "small";
    compact?: boolean;
    icon?: boolean;
    className?: string;
    children?: ReactNode;
    style?: Record<string, string>;
}

export const ButtonGroup: FC<ButtonGroupProps> = ({
    size,
    compact,
    icon,
    className,
    children,
    style,
}) => {
    const classNames = [
        groupStyles.group,
        size && groupStyles[size],
        compact && groupStyles.compact,
        icon && groupStyles.icon,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classNames} style={style}>
            {children}
        </div>
    );
};
