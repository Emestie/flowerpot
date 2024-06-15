import { useHighlights } from "../hooks/useHighlights";

interface Props {
    text: string;
    isBold?: boolean;
    color?: string;
}

export function HighlightenText({ text, color, isBold }: Props) {
    const highlights = useHighlights();

    const style: React.CSSProperties = {
        fontWeight: isBold ? "bold" : undefined,
        color: color ?? undefined,
    };

    if (!highlights.length) return <span style={style}>{text}</span>;

    const replaced = text.replace(
        new RegExp(`(${highlights.join("|")})`, "gi"),
        (replacee) => `<span class="marked">${replacee}</span>`
    );

    return <span style={style} dangerouslySetInnerHTML={{ __html: replaced }}></span>;
}
