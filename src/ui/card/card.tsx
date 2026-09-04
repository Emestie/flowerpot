import type { FC, ReactNode, HTMLAttributes } from "react";
import styles from "./card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
    wide?: boolean;
}

export interface CardContentProps {
    className?: string;
    children?: ReactNode;
}

export interface CardMetaProps {
    children?: ReactNode;
}

const CardContent: FC<CardContentProps> = ({ className, children }) => {
    const classNames = [styles.content, className].filter(Boolean).join(" ");
    return <div className={classNames}>{children}</div>;
};

const CardMeta: FC<CardMetaProps> = ({ children }) => <div className={styles.meta}>{children}</div>;

const CardComponent: FC<CardProps> = ({ className, children, onClick, wide, ...rest }) => {
    const classNames = [styles.card, wide && styles.wide, className].filter(Boolean).join(" ");
    return (
        <div className={classNames} onClick={onClick} {...rest}>
            {children}
        </div>
    );
};

export const Card = Object.assign(CardComponent, {
    Content: CardContent,
    Meta: CardMeta,
}) as FC<CardProps> & {
    Content: typeof CardContent;
    Meta: typeof CardMeta;
};
