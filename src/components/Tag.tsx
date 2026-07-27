import { Label } from "../ui/label";
import { tagPalette } from "../modules/palette";
import { HighlightenText } from "./HighlightenText";

interface IProps {
    text: string;
}

export function Tag(props: IProps) {
    const { text } = props;

    const color = tagPalette.getColor(text).hex;

    return (
        <Label key={Math.random()} size="mini" customColor={color} style={{ marginRight: 2 }}>
            <HighlightenText text={text} />
        </Label>
    );
}
