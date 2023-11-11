import { Label } from "semantic-ui-react";

interface IProps {
    text: string;
}

export function Tag(props: IProps) {
    const { text } = props;

    const colorNumber = getColorNumber(text);

    const color = colors[colorNumber];

    return (
        <Label
            key={Math.random()}
            size="mini"
            basic
            style={{ padding: "3px 4px", marginRight: 2, color: "white", backgroundColor: color, borderColor: color }}
        >
            {text}
        </Label>
    );
}

function getColorNumber(text: string): number {
    const letters = text.split("");

    const charcodes = letters.map((x) => x.charCodeAt(0));

    const sum = charcodes.reduce((prev, next) => next + prev, 0);

    return sum % 32;
}

const colors = [
    "#ADC393",
    "#A0B7E5",
    "#648DE5",
    "#304E89",
    "#FAC748",
    "#FA8EAD",
    "#02BBFA",
    "#179AB4",
    "#558C30",
    "#0F4A11",
    "#3772FF",
    "#FF8204",
    "#145DA0",
    "#2D704B",
    "#FFCF02",
    "#EA6426",
    "#3B4E37",
    "#C49F86",
    "#477699",
    "#F97476",
    "#D165B5",
    "#5C4AE5",
    "#17697B",
    "#655B7C",
    "#D73F44",
    "#EC8F5E",
    "#F3B564",
    "#9FBB73",
    "#BE3144",
    "#F15941",
    "#B0A695",
    "#8B3EFF",
];
