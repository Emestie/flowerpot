import { useHighlights } from "../hooks/useHighlights";

interface Props {
    text: string;
}

export function HighlightenText({ text }: Props) {
    const highlights = useHighlights();

    if (!highlights.length) return <span>{text}</span>;

    const escapedHighlights = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escapedHighlights.join("|")})`, "gi");

    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) =>
                i % 2 === 1 ? (
                    <span key={i} className="marked">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
}
