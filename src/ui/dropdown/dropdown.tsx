import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, FC, KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import type { DropdownItemProps } from "./dropdown-item-props";
import { Icon } from "../icon";
import styles from "./dropdown.module.css";

export interface DropdownProps {
    options: DropdownItemProps[];
    value: string | number;
    onChange?: (event: any, data: { value: string | number }) => void;
    disabled?: boolean;
    placeholder?: string;
    fluid?: boolean;
    className?: string;
    style?: CSSProperties;
}

const Dropdown: FC<DropdownProps> = ({ options, value, onChange, disabled, placeholder, fluid, className, style }) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
        top: 0,
        left: 0,
        width: 0,
    });
    const rootRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    const updateCoords = () => {
        const el = rootRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setCoords({ top: rect.bottom + 2, left: rect.left, width: rect.width });
    };

    useLayoutEffect(() => {
        if (open) updateCoords();
    }, [open, options]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: MouseEvent) => {
            if (
                rootRef.current &&
                !rootRef.current.contains(e.target as Node) &&
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        const onScrollOrResize = () => {
            updateCoords();
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKey);
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("scroll", onScrollOrResize, true);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, [open]);

    const classNames = [
        styles.dropdown,
        open && styles.visible,
        fluid && styles.fluid,
        disabled && styles.disabled,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const toggle = () => {
        if (!disabled) setOpen((v) => !v);
    };

    const select = (option: DropdownItemProps) => {
        if (option.disabled) return;
        setOpen(false);
        onChange?.(null, { value: option.value });
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
        }
    };

    return (
        <div
            ref={rootRef}
            className={classNames}
            style={style}
            tabIndex={disabled ? undefined : 0}
            role="listbox"
            onKeyDown={onKeyDown}
        >
            <div className={styles.text} onClick={toggle} role="button" aria-haspopup="listbox">
                {selected ? (
                    <span className={styles.selected}>{selected.text}</span>
                ) : (
                    <span className={styles.placeholder}>{placeholder}</span>
                )}
                <Icon name="dropdown" className={styles.caret} />
            </div>
            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        className={styles.menu}
                        role="listbox"
                        style={{ top: coords.top, left: coords.left, minWidth: coords.width }}
                    >
                        {options.map((option) => {
                            const itemClassNames = [
                                styles.item,
                                option.value === value && styles.active,
                                option.disabled && styles.itemDisabled,
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <div
                                    key={option.key}
                                    className={itemClassNames}
                                    role="option"
                                    aria-selected={option.value === value}
                                    aria-disabled={option.disabled}
                                    onClick={() => select(option)}
                                >
                                    {option.text}
                                </div>
                            );
                        })}
                    </div>,
                    document.body
                )}
        </div>
    );
};

export { Dropdown };
