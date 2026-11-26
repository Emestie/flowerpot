import { useCallback, useState } from "react";
import type { MouseEvent } from "react";

export interface IContextMenuPosition {
    x: number;
    y: number;
}

export interface IContextMenuController {
    isOpen: boolean;
    position: IContextMenuPosition | null;
    /** Opens the menu at the cursor of the right click. Prevents the native menu. */
    open: (event: MouseEvent) => void;
    /** Opens the menu at an explicit viewport position (e.g. under a "⋯" button). */
    openAt: (position: IContextMenuPosition) => void;
    close: () => void;
}

/**
 * Right-click state of one menu. Pair the returned controller with
 * `<ContextMenu controller={...}>` and pass `controller.open` as `onContextMenu`
 * of the element the menu belongs to (a whole row, not its individual cells).
 */
export function useContextMenu(): IContextMenuController {
    const [position, setPosition] = useState<IContextMenuPosition | null>(null);

    const openAt = useCallback((next: IContextMenuPosition) => {
        // Always replace the position: right-clicking the same target twice must
        // move the menu, not close it.
        setPosition(next);
    }, []);

    const open = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            openAt({ x: event.clientX, y: event.clientY });
        },
        [openAt]
    );

    const close = useCallback(() => setPosition(null), []);

    return { isOpen: position !== null, position, open, openAt, close };
}
