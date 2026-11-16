import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ContextMenu, useContextMenu } from "../ui/context-menu";
import { Menu } from "../ui/menu";

interface IHarnessProps {
    onAction?: () => void;
}

/** A row that opens a menu, plus a StopPropagation row that mimics the list's own handlers. */
function Harness({ onAction }: IHarnessProps) {
    const menu = useContextMenu();

    return (
        <div>
            <div data-testid="row" onContextMenu={menu.open}>
                row
            </div>
            <div data-testid="other-row" onMouseDown={(e) => e.stopPropagation()} onContextMenu={menu.open}>
                other row
            </div>
            <div data-testid="scroller">
                <div data-testid="nested" />
            </div>
            <ContextMenu controller={menu}>
                <Menu vertical>
                    <Menu.Item onClick={onAction}>Act</Menu.Item>
                </Menu>
            </ContextMenu>
        </div>
    );
}

const openMenu = (element: HTMLElement = screen.getByTestId("row"), position = { clientX: 120, clientY: 80 }) =>
    fireEvent.contextMenu(element, position);

const queryMenu = () => screen.queryByRole("menu");

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe("ContextMenu", () => {
    it("opens at the cursor of the right click", () => {
        render(<Harness />);
        expect(queryMenu()).toBeNull();

        openMenu();

        const menu = queryMenu()!;
        expect(menu).not.toBeNull();
        expect(menu.style.left).toBe("120px");
        expect(menu.style.top).toBe("80px");
    });

    it("moves instead of closing when the same row is right-clicked again", () => {
        render(<Harness />);

        openMenu(screen.getByTestId("row"), { clientX: 120, clientY: 80 });
        openMenu(screen.getByTestId("row"), { clientX: 300, clientY: 260 });

        const menu = queryMenu()!;
        expect(menu).not.toBeNull();
        expect(menu.style.left).toBe("300px");
        expect(menu.style.top).toBe("260px");
    });

    it("closes on an outside mousedown even when the target stops propagation", () => {
        render(<Harness />);
        openMenu();

        // The row's own handlers call stopPropagation (Status does); a menu that
        // survives such a click never closes on the obvious "click elsewhere".
        fireEvent.mouseDown(screen.getByTestId("other-row"));

        expect(queryMenu()).toBeNull();
    });

    it("closes on an outside right click", () => {
        render(<Harness />);
        openMenu();

        fireEvent.contextMenu(document.body);

        expect(queryMenu()).toBeNull();
    });

    it("stays open when the menu itself is clicked", () => {
        render(<Harness />);
        openMenu();

        fireEvent.mouseDown(queryMenu()!);

        expect(queryMenu()).not.toBeNull();
    });

    it("closes after an item is clicked and runs its handler", () => {
        const onAction = vi.fn();
        render(<Harness onAction={onAction} />);
        openMenu();

        fireEvent.click(screen.getByText("Act"));

        expect(onAction).toHaveBeenCalledTimes(1);
        expect(queryMenu()).toBeNull();
    });

    it("closes when a nested scroller scrolls", () => {
        render(<Harness />);
        openMenu();

        fireEvent.scroll(screen.getByTestId("nested"));

        expect(queryMenu()).toBeNull();
    });

    it("closes on Escape", () => {
        render(<Harness />);
        openMenu();

        fireEvent.keyDown(document, { key: "Escape" });

        expect(queryMenu()).toBeNull();
    });

    it("closes when the window loses focus", () => {
        render(<Harness />);
        openMenu();

        fireEvent(window, new Event("blur"));

        expect(queryMenu()).toBeNull();
    });
});
