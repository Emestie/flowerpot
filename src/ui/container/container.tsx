import type { FC, ReactNode } from "react";
import styles from "./container.module.css";

export interface ContainerProps {
    fluid?: boolean;
    className?: string;
    children?: ReactNode;
}

const Container: FC<ContainerProps> = ({ fluid, className, children }) => {
    const classNames = [styles.container, fluid && styles.fluid, className].filter(Boolean).join(" ");
    return <div className={classNames}>{children}</div>;
};

export default Container;
