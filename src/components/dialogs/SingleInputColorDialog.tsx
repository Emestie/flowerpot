import React, { useState, useEffect } from "react";
import { Confirm, TextArea, Form } from "semantic-ui-react";
import ColorPicker from "../ColorPicker";

interface IProps {
    show: boolean;
    caption: string;
    onClose: (e?: any) => void;
    onOk: (text: string, color?: string, collection?: string) => void;
    initialText?: string;
    initialColor?: string;
    basic?: boolean;
    showColors?: boolean;
    area?: boolean;
    dropdownValues?: string[];
}

export default (p: IProps) => {
    const [textValue, setTextValue] = useState("");
    const [collectionValue, setCollectionValue] = useState(p.dropdownValues?.[0] || "");
    const [colorValue, setColorValue] = useState<string | undefined>(undefined);

    const showDropdown = !!p.dropdownValues;

    useEffect(() => {
        setTextValue(p.initialText || "");
        setColorValue(p.initialColor);
    }, [p.initialColor, p.initialText]);

    useEffect(() => {
        if (p.show) {
            const inp1 = document.querySelector(".af-input input");
            const inp2 = document.querySelector("textarea.af-input");
            if (inp1) (inp1 as any).focus();
            if (inp2) (inp2 as any).focus();
        }
    }, [p.show]);

    const onConfirm = () => {
        p.onOk(textValue, colorValue, collectionValue);
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
            onKeyPress={(e) => {
                if (e.charCode === 13 && !p.area) onConfirm();
            }}
        >
            <div style={{ marginBottom: 20 }}>{p.caption}</div>
            <div>
                {p.area ? (
                    <TextArea
                        style={{ width: "100%" }}
                        value={textValue}
                        className="af-input"
                        onChange={(e, data) => {
                            setTextValue((data.value || "") as string);
                        }}
                        maxLength="500"
                    />
                ) : (
                    <Form>
                        <Form.Group inline>
                            {!!showDropdown && (
                                <Form.Select
                                    label=""
                                    options={(p.dropdownValues || []).map((x) => ({ key: x, text: x, value: x }))}
                                    value={collectionValue}
                                    onChange={(e, { value }) => {
                                        setCollectionValue(value as string);
                                    }}
                                />
                            )}
                            <Form.Input
                                style={{ width: "100%" }}
                                value={textValue}
                                onChange={(e) => {
                                    setTextValue(e.target.value);
                                }}
                                maxLength="50"
                                className="af-input"
                            />
                        </Form.Group>
                    </Form>
                )}
            </div>
            {!!p.showColors && (
                <div style={{ marginTop: 10 }}>
                    <ColorPicker value={colorValue} onPick={setColorValue} />
                </div>
            )}
        </div>
    );

    return <Confirm open={p.show} content={singleLabelDialogContent} onCancel={onCancel} onConfirm={onConfirm} />;
};
