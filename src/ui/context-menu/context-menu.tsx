import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import type { IContextMenuController, IContextMenuPosition } from "./use-context-menu";
import styles from "./context-menu.module.css";

/** Distance kept between the menu and the window edges, in CSS pixels. */
const VIEWPORT_MARGIN = 8;

interface IPlacement {
    left: number;
    top: number;
    maxHeight?: number;
}

export interface ContextMenuProps {
    controller: IContextMenuController;
    children?: ReactNode;
    className?: string;
}

/**
 * Right-click menu rendered into `document.body`.
 *
 * Closes on any outside mousedown, outside right click, scroll (including
 * nested scrollers), resize, Escape, window blur and after an item is clicked.
 */
export const ContextMenu: FC<ContextMenuProps> = ({ controller, children, className }) => {
    const { isOpen, position, close } = controller;

    const menuRef = useRef<HTMLDivElement>(null);
    const [placement, setPlacement] = useState<IPlacement | null>(null);

    // Placed in the same commit as the open, so the browser never paints the
    // menu at the previous position or at the top-left corner.
    useLayoutEffect(() => {
        const menu = menuRef.current;
        if (!isOpen || !position || !menu) return;

        setPlacement(measure(menu, position));
    }, [isOpen, position]);

    useEffect(() => {
        if (!isOpen) return;

        // Capture phase on purpose: handlers inside the list (Status) stop
        // propagation, and a menu that survives a click because of that is a bug.
        const closeIfOutside = (event: globalThis.MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) close();
        };
        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") close();
        };
        const onScrollOrResizeOrBlur = () => close();

        document.addEventListener("mousedown", closeIfOutside, true);
        document.addEventListener("contextmenu", closeIfOutside, true);
        document.addEventListener("keydown", onKeyDown, true);
        window.addEventListener("scroll", onScrollOrResizeOrBlur, true);
        window.addEventListener("resize", onScrollOrResizeOrBlur);
        // Clicking another window (or anything outside the renderer) never
        // produces a mousedown here, so the menu would otherwise stay on screen.
        window.addEventListener("blur", onScrollOrResizeOrBlur);

        return () => {
            document.removeEventListener("mousedown", closeIfOutside, true);
            document.removeEventListener("contextmenu", closeIfOutside, true);
            document.removeEventListener("keydown", onKeyDown, true);
            window.removeEventListener("scroll", onScrollOrResizeOrBlur, true);
            window.removeEventListener("resize", onScrollOrResizeOrBlur);
            window.removeEventListener("blur", onScrollOrResizeOrBlur);
        };
    }, [isOpen, close]);

    if (!isOpen || !position) return null;

    return createPortal(
        <div
            ref={menuRef}
            role="menu"
            className={[styles.menu, className].filter(Boolean).join(" ")}
            style={{
                left: placement?.left ?? position.x,
                top: placement?.top ?? position.y,
                maxHeight: placement?.maxHeight,
            }}
            // Every menu item closes the menu; its own onClick runs first.
            onClick={close}
        >
            {children}
        </div>,
        document.body
    );
};

/**
 * Native-like placement: the menu drops down-right from the cursor, flips to
 * the other side when it would leave the viewport, and is capped in height
 * (scrollable) when it cannot fit either way.
 */
function measure(menu: HTMLElement, position: IContextMenuPosition): IPlacement {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const rect = menu.getBoundingClientRect();

    const heightLimit = Math.max(VIEWPORT_MARGIN, viewportHeight - 2 * VIEWPORT_MARGIN);
    const height = Math.min(rect.height, heightLimit);

    let left = position.x;
    let top = position.y;

    if (left + rect.width > viewportWidth - VIEWPORT_MARGIN) left = position.x - rect.width;
    if (top + height > viewportHeight - VIEWPORT_MARGIN) top = position.y - height;

    return {
        left: clamp(left, VIEWPORT_MARGIN, viewportWidth - rect.width - VIEWPORT_MARGIN),
        top: clamp(top, VIEWPORT_MARGIN, viewportHeight - height - VIEWPORT_MARGIN),
        maxHeight: rect.height > heightLimit ? heightLimit : undefined,
    };
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}
