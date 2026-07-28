import type { FC, ReactNode } from "react";
import styles from "./card.module.css";

export interface CardProps {
    className?: string;
    children?: ReactNode;
}

export interface CardContentProps {
    children?: ReactNode;
}

export interface CardMetaProps {
    children?: ReactNode;
}

const CardContent: FC<CardContentProps> = ({ children }) => <div className={styles.content}>{children}</div>;

const CardMeta: FC<CardMetaProps> = ({ children }) => <div className={styles.meta}>{children}</div>;

const CardComponent: FC<CardProps> = ({ className, children }) => {
    const classNames = [styles.card, className].filter(Boolean).join(" ");
    return <div className={classNames}>{children}</div>;
};

export const Card = Object.assign(CardComponent, {
    Content: CardContent,
    Meta: CardMeta,
}) as FC<CardProps> & {
    Content: typeof CardContent;
    Meta: typeof CardMeta;
};
