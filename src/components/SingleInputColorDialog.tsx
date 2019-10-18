import React, { useState, useEffect, useRef } from "react";
import { Input, Radio, Label, Confirm } from "semantic-ui-react";

interface IProps {
    show: boolean;
    caption: string;
    onClose: (e?: any) => void;
    onOk: (text: string, color?: string) => void;
    initialText?: string;
    initialColor?: string;
    basic?: boolean;
    showColors?: boolean;
}

const colorList = ["red", "orange", "yellow", "olive", "green", "teal", "blue", "brown", "grey"];

export default (p: IProps) => {
    const [textValue, setTextValue] = useState("");
    const [colorValue, setColorValue] = useState<string | undefined>(undefined);
    const inputRef = useRef();

    useEffect(() => {
        setTextValue(p.initialText || "");
        setColorValue(p.initialColor);
    }, [p.initialColor, p.initialText]);

    useEffect(() => {
        if (p.show && inputRef && inputRef.current) (inputRef.current as any).focus();
    }, [p.show]);

    const onConfirm = () => {
        p.onOk(textValue, colorValue);
        setColorValue(undefined);
        setTextValue("");
    };

    const onCancel = () => {
        setColorValue(undefined);
        setTextValue("");
        p.onClose();
    };

    const singleLabelDialogContent = (
        <div
            style={{ padding: 20 }}
            onKeyPress={e => {
                if (e.charCode == 13) onConfirm();
            }}
        >
            <div style={{ marginBottom: 20 }}>{p.caption}</div>
            <div>
                <Input
                    style={{ width: "100%" }}
                    value={textValue}
                    onChange={e => {
                        setTextValue(e.target.value);
                    }}
                    maxLength="50"
                    ref={inputRef as any}
                />
            </div>
            {!!p.showColors && (
                <div style={{ marginTop: 10 }}>
                    {colorList.map(c => (
                        <Radio
                            key={c}
                            label={
                                <Label basic={p.basic} style={{ marginRight: 10, userSelect: "none" }} circular size="mini" color={c as any}>
                                    {colorValue === c ? "✔" : <span style={{ opacity: 0 }}>✔</span>}
                                </Label>
                            }
                            name="colorGrp"
                            checked={colorValue === c}
                            onChange={() => setColorValue(c)}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return <Confirm open={p.show} content={singleLabelDialogContent} onCancel={onCancel} onConfirm={onConfirm} />;
};
