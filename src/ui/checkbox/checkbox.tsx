import type { FC, ReactNode, ChangeEvent } from "react";
import { useId } from "react";
import styles from "./checkbox.module.css";

export interface CheckboxProps {
    checked?: boolean;
    name?: string;
    value?: string | number;
    label?: ReactNode;
    onChange?: (event: ChangeEvent<HTMLInputElement>, data: CheckboxProps) => void;
    className?: string;
    disabled?: boolean;
    indicator?: boolean;
}

export const Checkbox: FC<CheckboxProps> = ({
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
    const inputId = `${uid}-checkbox`;

    const classNames = [
        styles.checkbox,
        checked && styles.checked,
        disabled && styles.disabled,
        !indicator && styles.noIndicator,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e, { checked: !checked, name, value });
    };

    return (
        <div className={classNames}>
            <input
                type="checkbox"
                id={inputId}
                name={name}
                value={value}
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                className={styles.input}
                tabIndex={0}
            />
            <label htmlFor={inputId} className={styles.label}>
                <span className={styles.checkmark}>
                    <svg className={styles.checkmarkSvg} viewBox="0 0 12 12">
                        <polyline points="2 6 5 9 10 3" />
                    </svg>
                </span>
                {label}
            </label>
        </div>
    );
};
