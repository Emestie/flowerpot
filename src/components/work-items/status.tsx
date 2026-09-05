import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { WorkItem } from "../../models/work-item";
import { Query } from "../../models/query";
import { HighlightenText } from "../HighlightenText";
import { s } from "../../values/Strings";
import { getApi } from "../../api/client";

interface Props {
    workItem: WorkItem;
    query: Query;
    onUpdate: (wi: WorkItem) => void;
    enableContextMenu?: boolean;
}

export function Status({ workItem, query, onUpdate, enableContextMenu = true }: Props) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [openUp, setOpenUp] = useState(false);
    const [menuMaxHeight, setMenuMaxHeight] = useState<number | undefined>(undefined);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const estimateMenuHeight = () => (workItem.states?.length ?? 0) * 29 + 10;
    const GAP = 8;

    const decidePlacement = (trigger: { top: number; bottom: number }, menuHeight: number) => {
        const spaceBelow = window.innerHeight - trigger.bottom - GAP;
        const spaceAbove = trigger.top - GAP;
        const up = spaceBelow < menuHeight && spaceAbove > spaceBelow;
        const avail = up ? spaceAbove : spaceBelow;
        return { up, maxH: avail < menuHeight ? Math.max(80, Math.floor(avail)) : undefined };
    };

    // Correct placement after mount but before paint (no flicker):
    // uses the real menu height (scrollHeight stays full even when capped).
    useLayoutEffect(() => {
        if (!open) return;
        const trigger = rootRef.current?.getBoundingClientRect();
        const actual = menuRef.current?.scrollHeight;
        if (!trigger || !actual) return;
        const { up, maxH } = decidePlacement(trigger, actual);
        setOpenUp((prev) => (prev === up ? prev : up));
        setMenuMaxHeight((prev) => (prev === maxH ? prev : maxH));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, workItem.states]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        const onScrollOrResize = () => setOpen(false);

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

    const change = async (newState: string) => {
        setOpen(false);
        if (newState === workItem.state || pending) return;
        setPending(true);
        setError(undefined);
        try {
            const updated = await getApi(query.accountId).workItem.updateState(workItem, newState, query);
            onUpdate(updated);
        } catch (e: any) {
            setError(e?.message || s("statusUpdateError"));
        } finally {
            setPending(false);
        }
    };

    const openMenu = () => {
        // Pre-compute placement synchronously so the first paint is already correct.
        const trigger = rootRef.current?.getBoundingClientRect();
        if (trigger) {
            const { up, maxH } = decidePlacement(trigger, estimateMenuHeight());
            setOpenUp(up);
            setMenuMaxHeight(maxH);
        } else {
            setOpenUp(false);
            setMenuMaxHeight(undefined);
        }
        setOpen(true);
    };

    const toggle = () => {
        if (pending) return;
        if (open) setOpen(false);
        else openMenu();
    };

    const text = pending ? "…" : workItem.state;
    const title = error ? s("statusUpdateError") + ": " + error : s("changeStatus") + workItem.state;

    return (
        <div className="wiStatusChanger" ref={rootRef}>
            <div
                className={"wiStatus wiStatusClickable" + (error ? " wiStatusError" : "")}
                title={title}
                onClick={toggle}
                onContextMenu={
                    enableContextMenu
                        ? (e) => {
                              e.preventDefault();
                              if (!pending && !open) openMenu();
                          }
                        : undefined
                }
            >
                {!pending && <span className="wiStatusDot" style={{ backgroundColor: "#" + workItem.stateColor }} />}
                <span className="wiStatusText">
                    <HighlightenText text={shrink(text)} />
                </span>
            </div>
            {open && workItem.states && (
                <div
                    ref={menuRef}
                    className={"wiStatusMenu" + (openUp ? " upward" : "")}
                    style={menuMaxHeight !== undefined ? { maxHeight: menuMaxHeight, overflowY: "auto" } : undefined}
                >
                    {workItem.states.map((st) => (
                        <div
                            key={st.name}
                            className={"wiStatusMenuItem" + (st.name === workItem.state ? " active" : "")}
                            onClick={() => change(st.name)}
                        >
                            <span className="wiStatusDot" style={{ backgroundColor: "#" + st.color }} />
                            <span>{st.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function shrink(text: string): string {
    const BASE_LIMIT = 11;

    if (text.length <= BASE_LIMIT) return text;

    const words = text.split(" ");

    if (words.length > 1) return words.map((x) => x.at(0)?.toUpperCase()).join("");

    return words.at(0)?.slice(0, BASE_LIMIT) + ".";
}
