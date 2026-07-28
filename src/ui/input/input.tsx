import type { FC, ChangeEvent, ReactNode } from "react";
import styles from "./input.module.css";

export interface InputProps {
    size?: "mini" | "small";
    fluid?: boolean;
    placeholder?: string;
    value?: string;
    label?: ReactNode;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    error?: boolean | string;
    maxLength?: number | string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

export const Input: FC<InputProps> = ({
    size,
    fluid,
    placeholder,
    value,
    label,
    onChange,
    error,
    maxLength,
    disabled,
    loading,
    className,
}) => {
    const classNames = [
        styles.input,
        size && styles[size],
        fluid && styles.fluid,
        error && styles.error,
        (disabled || loading) && styles.disabled,
        loading && styles.loading,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const errorText = typeof error === "string" ? error : undefined;

    return (
        <div className={classNames}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                maxLength={maxLength as number | undefined}
                disabled={disabled || loading}
            />
            {loading && <span className={styles.loader} />}
            {errorText && <div className={styles.errorText}>{errorText}</div>}
        </div>
    );
};
