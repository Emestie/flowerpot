import type { FC, ReactNode, ChangeEvent } from "react";
import { useId } from "react";
import styles from "./radio.module.css";

export interface RadioProps {
    checked?: boolean;
    name?: string;
    value?: string | number;
    label?: ReactNode;
    onChange?: (event: ChangeEvent<HTMLInputElement>, data: RadioProps) => void;
    className?: string;
    disabled?: boolean;
    indicator?: boolean;
}

export const Radio: FC<RadioProps> = ({
    checked,
    name,
    value,
    label,
    onChange,
    className,
    disabled,
    indicator = true,
}) => {
    const uid = useId();
    const inputId = `${uid}-radio`;

    const classNames = [
        styles.radio,
        checked && styles.checked,
        disabled && styles.disabled,
        !indicator && styles.noIndicator,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e, { checked, name, value });
    };

    return (
        <div className={classNames}>
            <input
                type="radio"
                id={inputId}
                name={name}
                value={value}
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                className={styles.input}
                tabIndex={0}
            />
            {label !== undefined && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}
        </div>
    );
};
