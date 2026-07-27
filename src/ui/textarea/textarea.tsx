import type { FC, ChangeEvent } from "react";
import styles from "./textarea.module.css";

export interface TextAreaProps {
    value?: string;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    maxLength?: number | string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    error?: boolean;
}

export const TextArea: FC<TextAreaProps> = ({
    value,
    onChange,
    rows = 3,
    maxLength,
    placeholder,
    className,
    disabled,
    error,
}) => {
    const classNames = [styles.textarea, error && styles.error, disabled && styles.disabled, className]
        .filter(Boolean)
        .join(" ");

    return (
        <textarea
            className={classNames}
            value={value}
            onChange={onChange}
            rows={rows}
            maxLength={maxLength as number | undefined}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
};
