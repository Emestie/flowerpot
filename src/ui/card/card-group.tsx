import type { FC, ReactNode } from "react";
import styles from "./card-group.module.css";

export interface CardGroupProps {
    className?: string;
    children?: ReactNode;
    stacked?: boolean;
}

export const CardGroup: FC<CardGroupProps> = ({ className, children, stacked }) => {
    const classNames = [styles.group, stacked && styles.stacked, className].filter(Boolean).join(" ");
    return <div className={classNames}>{children}</div>;
};
