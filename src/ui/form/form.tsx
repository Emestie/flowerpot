import type { FC, ChangeEvent, ReactNode } from "react";
import styles from "./form.module.css";
import { Input } from "../input";
import { Button } from "../button";
import { Dropdown, DropdownItemProps } from "../dropdown";

export interface FormProps {
    loading?: boolean;
    className?: string;
    children?: ReactNode;
}

export interface FormSelectProps {
    label?: ReactNode;
    options: DropdownItemProps[];
    value: string | number;
    onChange?: (event: ChangeEvent<HTMLSelectElement>, data: { value: string | number }) => void;
    disabled?: boolean;
    className?: string;
}

const Select: FC<FormSelectProps> = ({ label, options, value, onChange, disabled, className }) => {
    const classNames = [styles.field, className].filter(Boolean).join(" ");

    return (
        <div className={classNames}>
            {label && <label className={styles.label}>{label}</label>}
            <Dropdown
                options={options}
                value={value}
                disabled={disabled}
                onChange={(event, data) => onChange?.(event as ChangeEvent<HTMLSelectElement>, data)}
            />
        </div>
    );
};

export const Form: FC<FormProps> & {
    Input: typeof Input;
    Button: typeof Button;
    Select: typeof Select;
    Group: FC<FormGroupProps>;
} = ({ loading, className, children }) => {
    const classNames = [styles.form, loading && styles.loading, className].filter(Boolean).join(" ");

    return (
        <form
            className={classNames}
            onSubmit={(e) => e.preventDefault()}
        >
            {loading && <span className={styles.loaderWrapper}>{children}</span>}
            {!loading && children}
        </form>
    );
};

export interface FormGroupProps {
    inline?: boolean;
    className?: string;
    children?: ReactNode;
}

const Group: FC<FormGroupProps> = ({ inline, className, children }) => {
    const classNames = [styles.group, inline && styles.inline, className].filter(Boolean).join(" ");

    return <div className={classNames}>{children}</div>;
};

Form.Input = Input;
Form.Button = Button;
Form.Select = Select;
Form.Group = Group;
