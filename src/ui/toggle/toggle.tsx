import type { FC, ReactNode, ChangeEvent } from "react";
import { useId } from "react";
import styles from "./toggle.module.css";

export interface ToggleProps {
    checked?: boolean;
    name?: string;
    value?: string | number;
    label?: ReactNode;
    onChange?: (event: ChangeEvent<HTMLInputElement>, data: ToggleProps) => void;
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
}

export const Toggle: FC<ToggleProps> = ({ checked, name, value, label, onChange, className, disabled, ariaLabel }) => {
    const uid = useId();
    const inputId = `${uid}-toggle`;

    const classNames = [styles.toggle, checked && styles.checked, disabled && styles.disabled, className]
        .filter(Boolean)
        .join(" ");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e, { checked: !checked, name, value });
    };

    return (
        <div className={classNames}>
            <input
                type="checkbox"
                role="switch"
                id={inputId}
                name={name}
                value={value}
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                aria-label={ariaLabel}
                className={styles.input}
                tabIndex={0}
            />
            <label htmlFor={inputId} className={styles.label}>
                <span className={styles.track} aria-hidden="true">
                    <span className={styles.knob} />
                </span>
                {label !== undefined && <span className={styles.labelText}>{label}</span>}
            </label>
        </div>
    );
};
