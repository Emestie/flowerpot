import { useHighlights } from "../hooks/useHighlights";

interface Props {
    text: string;
}

export function HighlightenText({ text }: Props) {
    const highlights = useHighlights();

    if (!highlights.length) return <span>{text}</span>;

    const escapedHighlights = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escapedHighlights.join("|")})`, "gi");

    const replaced = text.replace(regex, (replacee) => `<span class="marked">${replacee}</span>`);

    return <span dangerouslySetInnerHTML={{ __html: replaced }}></span>;
}
