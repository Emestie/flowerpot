import type { FC, ReactNode } from "react";
import styles from "./message.module.css";

export interface MessageProps {
    info?: boolean;
    positive?: boolean;
    negative?: boolean;
    error?: boolean;
    warning?: boolean;
    visible?: boolean;
    icon?: boolean;
    size?: "tiny" | "mini";
    color?: "red";
    className?: string;
    children?: ReactNode;
}

export interface MessageHeaderProps {
    children?: ReactNode;
}

export interface MessageContentProps {
    children?: ReactNode;
}

const MessageHeader: FC<MessageHeaderProps> = ({ children }) => (
    <div className={styles.header}>{children}</div>
);

const MessageContent: FC<MessageContentProps> = ({ children }) => (
    <div className={styles.content}>{children}</div>
);

const MessageComponent: FC<MessageProps> = ({
    info,
    positive,
    negative,
    error,
    warning,
    visible,
    icon,
    size,
    color,
    className,
    children,
}) => {
    const classNames = [
        styles.message,
        info && styles.info,
        positive && styles.positive,
        negative && styles.negative,
        error && styles.error,
        warning && styles.warning,
        icon && styles.icon,
        size && styles[size],
        color && styles[color],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return <div className={classNames}>{children}</div>;
};

export const Message = Object.assign(MessageComponent, {
    Header: MessageHeader,
    Content: MessageContent,
}) as FC<MessageProps> & {
    Header: typeof MessageHeader;
    Content: typeof MessageContent;
};
