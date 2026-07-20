import type { FC, ReactNode } from "react";
import styles from "./form.module.css";
import { Input } from "../input";
import { Button } from "../button";
import { Form as SuiForm } from "semantic-ui-react";

export interface FormProps {
    loading?: boolean;
    className?: string;
    children?: ReactNode;
}

export const Form: FC<FormProps> & {
    Input: typeof Input;
    Button: typeof Button;
    Select: typeof SuiForm.Select;
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
Form.Select = SuiForm.Select;
Form.Group = Group;
