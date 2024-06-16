import { useHighlights } from "../hooks/useHighlights";

interface Props {
    text: string;
}

export function HighlightenText({ text }: Props) {
    const highlights = useHighlights();

    if (!highlights.length) return <span>{text}</span>;

    const replaced = text.replace(
        new RegExp(`(${highlights.join("|")})`, "gi"),
        (replacee) => `<span class="marked">${replacee}</span>`
    );

    return <span dangerouslySetInnerHTML={{ __html: replaced }}></span>;
}
