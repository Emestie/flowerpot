import { Label } from "../ui/label";
import { tagPalette } from "../modules/palette";
import { HighlightenText } from "./HighlightenText";

interface IProps {
    text: string;
}

export function Tag(props: IProps) {
    const { text } = props;

    const colorObj = tagPalette.getColor(text);
    const color = colorObj.hex;
    const textColor = colorObj.textColor === "light" ? "#fff" : "#333";

    return (
        <Label key={Math.random()} size="mini" customColor={color} style={{ marginRight: 2, color: textColor }}>
            <HighlightenText text={text} />
        </Label>
    );
}
