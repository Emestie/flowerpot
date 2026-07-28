import type { FC, ReactNode, MouseEvent } from "react";
import styles from "./button.module.css";

export interface ButtonProps {
    id?: string;
    icon?: boolean;
    size?: "mini" | "tiny" | "small";
    compact?: boolean;
    primary?: boolean;
    positive?: boolean;
    negative?: boolean;
    basic?: boolean;
    loading?: boolean;
    disabled?: boolean;
    labelPosition?: "left";
    title?: string;
    hint?: string;
    className?: string;
    children?: ReactNode;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    style?: Record<string, string>;
}

export const Button: FC<ButtonProps> = ({
    id,
    icon,
    size,
    compact,
    primary,
    positive,
    negative,
    basic,
    loading,
    disabled,
    labelPosition,
    title,
    hint,
    className,
    children,
    onClick,
    style,
}) => {
    const classNames = [
        styles.btn,
        size && styles[size],
        compact && styles.compact,
        icon && styles.icon,
        primary && styles.primary,
        positive && styles.positive,
        negative && styles.negative,
        basic && styles.basic,
        loading && styles.loading,
        (disabled || loading) && styles.disabled,
        labelPosition === "left" && styles.labeledLeft,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button id={id} className={classNames} disabled={disabled || loading} title={title} onClick={onClick} style={style}>
            {children}
            {loading && <span className={styles.loader} />}
        </button>
    );
};
