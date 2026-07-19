import type { FC, ChangeEvent } from "react";
import styles from "./input.module.css";

export interface InputProps {
    size?: "mini" | "small";
    fluid?: boolean;
    placeholder?: string;
    value?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
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

    return (
        <div className={classNames}>
            <input
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                maxLength={maxLength as number | undefined}
                disabled={disabled || loading}
            />
            {loading && <span className={styles.loader} />}
        </div>
    );
};
