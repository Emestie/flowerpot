import type { FC, ReactNode, MouseEvent } from "react";
import { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./confirm.module.css";

export interface ConfirmProps {
    open?: boolean;
    content?: ReactNode;
    onCancel?: (event: MouseEvent<HTMLElement>) => void;
    onConfirm?: (event: MouseEvent<HTMLElement>) => void;
}

export const Confirm: FC<ConfirmProps> = ({ open, content, onCancel, onConfirm }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel?.(e as unknown as MouseEvent<HTMLElement>);
            }
        },
        [onCancel]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [open, handleKeyDown]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [open]);

    const handleDimmerClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onCancel?.(e);
        }
    };

    if (!open) return null;

    return createPortal(
        <div className={styles.dimmer} onClick={handleDimmerClick}>
            <div className={styles.modal} ref={modalRef}>
                <div className={styles.content}>{content}</div>
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        Cancel
                    </button>
                    <button className={styles.confirmBtn} onClick={onConfirm}>
                        OK
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
