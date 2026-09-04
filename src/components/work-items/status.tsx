import { useEffect, useRef, useState } from "react";
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
    const rootRef = useRef<HTMLDivElement>(null);

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

    const text = pending ? "…" : workItem.state;
    const title = error ? s("statusUpdateError") + ": " + error : s("changeStatus") + workItem.state;

    return (
        <div className="wiStatusChanger" ref={rootRef}>
            <div
                className={"wiStatus wiStatusClickable" + (error ? " wiStatusError" : "")}
                title={title}
                onClick={() => !pending && setOpen((v) => !v)}
                onContextMenu={
                    enableContextMenu
                        ? (e) => {
                              e.preventDefault();
                              if (!pending) setOpen(true);
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
                <div className="wiStatusMenu">
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
