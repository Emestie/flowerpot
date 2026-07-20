import type { CSSProperties, FC, HTMLAttributes, ReactNode } from "react";
import styles from "./header.module.css";

export type HeaderTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "p";

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
    as?: HeaderTag;
    dividing?: boolean;
    sub?: boolean;
    block?: boolean;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
}

export const Header: FC<HeaderProps> = ({ as = "h3", dividing, sub, block, className, children, ...rest }) => {
    const Tag = as;

    const classNames = [styles.header, dividing && styles.dividing, sub && styles.sub, block && styles.block, className]
        .filter(Boolean)
        .join(" ");

    return (
        <Tag className={classNames} {...rest}>
            {children}
        </Tag>
    );
};
