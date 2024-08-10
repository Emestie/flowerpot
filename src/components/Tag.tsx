import { Label } from "semantic-ui-react";
import { tagPalette } from "../modules/palette";
import { HighlightenText } from "./HighlightenText";

interface IProps {
    text: string;
}

export function Tag(props: IProps) {
    const { text } = props;

    const color = tagPalette.getColor(text).hex;

    return (
        <Label
            key={Math.random()}
            size="mini"
            basic
            style={{ padding: "3px 4px", marginRight: 2, color: "white", backgroundColor: color, borderColor: color }}
        >
            <HighlightenText text={text} />
        </Label>
    );
}
