import type { CSSProperties, FC, MouseEvent } from "react";
import type { SemanticICONS } from "./semantic-icons";
import "./icon.css";

export type TIconColor =
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

export type TIconSize = "mini" | "tiny" | "small" | "large" | "big" | "huge" | "massive";

export type TIconFlipped = "horizontally" | "vertically";

export type TIconRotated = "clockwise" | "counterclockwise";

export interface IconProps {
    name: SemanticICONS;
    size?: TIconSize;
    color?: TIconColor;
    loading?: boolean;
    disabled?: boolean;
    fitted?: boolean;
    bordered?: boolean;
    circular?: boolean;
    link?: boolean;
    inverted?: boolean;
    flipped?: TIconFlipped;
    rotated?: TIconRotated;
    corner?: boolean;
    className?: string;
    style?: CSSProperties;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export const Icon: FC<IconProps> = ({
    name,
    size,
    color,
    loading,
    disabled,
    fitted,
    bordered,
    circular,
    link,
    inverted,
    flipped,
    rotated,
    corner,
    className,
    style,
    onClick,
}) => {
    const classNames = [
        "icon",
        name,
        size,
        color,
        loading && "loading",
        disabled && "disabled",
        fitted && "fitted",
        bordered && "bordered",
        circular && "circular",
        link && "link",
        inverted && "inverted",
        flipped && `flipped ${flipped}`,
        rotated && `rotated ${rotated}`,
        corner && "corner",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <i
            className={classNames}
            onClick={onClick}
            style={style}
            aria-hidden="true"
        />
    );
};
