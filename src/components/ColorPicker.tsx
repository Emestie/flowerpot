import { Label, type TColor } from "../ui/label";
import { Radio } from "../ui/radio";

const colorList: (TColor | undefined)[] = [
    "red",
    "orange",
    "yellow",
    "olive",
    "green",
    "teal",
    "blue",
    "brown",
    "grey",
    undefined,
];

interface P {
    value: string | undefined;
    onPick: (color: string | undefined) => void;
}

export default function ColorPicker(p: P) {
    const { value, onPick } = p;

    return (
        <div>
            {colorList.map((c) => (
                <Radio
                    key={c || "def"}
                    indicator={false}
                    label={
                        <Label
                            basic={value !== c}
                            className="color-picker-label"
                            circular
                            size="mini"
                            color={c}
                        ></Label>
                    }
                    name="colorGrp"
                    checked={value === c}
                    onChange={() => onPick(c)}
                />
            ))}
        </div>
    );
}
