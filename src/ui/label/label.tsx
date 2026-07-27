import type { CSSProperties, FC, KeyboardEvent, MouseEvent, ReactNode } from "react";
import styles from "./label.module.css";

export type TColor =
    | "red"
    | "orange"
    | "yellow"
    | "olive"
    | "green"
    | "teal"
    | "blue"
    | "violet"
    | "purple"
    | "pink"
    | "brown"
    | "grey"
    | "black";

export interface LabelProps {
    color?: TColor;
    size?: "mini";
    basic?: boolean;
    circular?: boolean;
    image?: boolean;
    as?: "a";
    className?: string;
    children?: ReactNode;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    style?: CSSProperties;
    /** Arbitrary CSS color (e.g. a hex from a palette) applied as background + text color, overriding semantic `color`. */
    customColor?: string;
}

export interface LabelDetailProps {
    children?: ReactNode;
}

const LabelDetail: FC<LabelDetailProps> = ({ children }) => <span className={styles.detail}>{children}</span>;

const LabelComponent: FC<LabelProps> = ({
    color,
    size,
    basic,
    circular,
    image,
    as,
    className,
    children,
    onClick,
    style,
    customColor,
}) => {
    const classNames = [
        styles.label,
        color && styles[color],
        size && styles[size],
        basic && styles.basic,
        circular && styles.circular,
        image && styles.image,
        (as === "a" || onClick) && styles.asLink,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const Tag = as === "a" ? "a" : "div";

    const customStyle: CSSProperties | undefined = customColor
        ? { backgroundColor: customColor, color: "#fff", borderColor: customColor, ...style }
        : style;

    const interactive = as === "a" || !!onClick;

    const onKeyDown = interactive
        ? (event: React.KeyboardEvent<HTMLElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onClick?.(event as unknown as MouseEvent<HTMLElement>);
              }
          }
        : undefined;

    return (
        <Tag
            className={classNames}
            onClick={onClick}
            onKeyDown={onKeyDown}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            style={customStyle}
        >
            {children}
        </Tag>
    );
};

export const Label = Object.assign(LabelComponent, {
    Detail: LabelDetail,
}) as FC<LabelProps> & {
    Detail: typeof LabelDetail;
};
