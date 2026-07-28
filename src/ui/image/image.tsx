import type { FC, ImgHTMLAttributes } from "react";
import styles from "./image.module.css";

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
    avatar?: boolean;
    spaced?: "left" | "right";
    src?: string | null;
}

export const Image: FC<ImageProps> = ({ avatar, spaced, className, src, ...rest }) => {
    const classNames = [
        styles.img,
        avatar && styles.avatar,
        spaced === "right" && styles.spacedRight,
        spaced === "left" && styles.spacedLeft,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return <img className={classNames} src={src ?? undefined} {...rest} />;
};
