import type { FC, ReactNode } from "react";
import styles from "./card-group.module.css";

export interface CardGroupProps {
    className?: string;
    children?: ReactNode;
}

export const CardGroup: FC<CardGroupProps> = ({ className, children }) => {
    const classNames = [styles.group, className].filter(Boolean).join(" ");
    return <div className={classNames}>{children}</div>;
};
