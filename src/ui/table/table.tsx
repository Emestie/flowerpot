import type {
    FC,
    ReactNode,
    CSSProperties,
    MouseEvent,
    HTMLAttributes,
    TdHTMLAttributes,
    ThHTMLAttributes,
} from "react";
import styles from "./table.module.css";

export type TableSize = "small" | "large";

export interface TableProps {
    compact?: boolean;
    celled?: boolean;
    size?: TableSize;
    className?: string;
    children?: ReactNode;
}

export const Table: FC<TableProps> & {
    Row: typeof Row;
    Header: typeof Header;
    HeaderCell: typeof HeaderCell;
    Body: typeof Body;
    Footer: typeof Footer;
    Cell: typeof Cell;
} = ({ compact, celled, size, className, children }) => {
    const classNames = [
        styles.table,
        compact && styles.compact,
        celled && styles.celled,
        size && styles[size],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return <table className={classNames}>{children}</table>;
};

export interface RowProps extends HTMLAttributes<HTMLTableRowElement> {
    negative?: boolean;
}

export const Row: FC<RowProps> = ({ negative, className, children, ...rest }) => {
    const classNames = [negative && styles.negative, className].filter(Boolean).join(" ");
    return (
        <tr className={classNames} {...rest}>
            {children}
        </tr>
    );
};

export interface CellProps extends TdHTMLAttributes<HTMLTableCellElement> {
    collapsing?: boolean;
}

export const Cell: FC<CellProps> = ({ collapsing, className, children, ...rest }) => {
    const classNames = [collapsing && styles.collapsing, className].filter(Boolean).join(" ");
    return (
        <td className={classNames} {...rest}>
            {children}
        </td>
    );
};

export interface HeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
    collapsing?: boolean;
}

export const HeaderCell: FC<HeaderCellProps> = ({ collapsing, className, children, ...rest }) => {
    const classNames = [collapsing && styles.collapsing, className].filter(Boolean).join(" ");
    return (
        <th className={classNames} {...rest}>
            {children}
        </th>
    );
};

export const Header: FC<{ className?: string; children?: ReactNode }> = ({ className, children }) => (
    <thead className={className}>{children}</thead>
);

export const Body: FC<{ className?: string; children?: ReactNode }> = ({ className, children }) => (
    <tbody className={className}>{children}</tbody>
);

export interface FooterProps {
    fullWidth?: boolean;
    className?: string;
    children?: ReactNode;
}

export const Footer: FC<FooterProps> = ({ fullWidth, className, children }) => {
    const classNames = [fullWidth && styles.fullWidth, className].filter(Boolean).join(" ");
    return <tfoot className={classNames}>{children}</tfoot>;
};

Table.Row = Row;
Table.Header = Header;
Table.HeaderCell = HeaderCell;
Table.Body = Body;
Table.Footer = Footer;
Table.Cell = Cell;

export type { CSSProperties, MouseEvent };
