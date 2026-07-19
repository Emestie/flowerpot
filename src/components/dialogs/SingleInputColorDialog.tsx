import { useEffect, useState } from "react";
import { Form } from "semantic-ui-react";
import { Confirm } from "../../ui/confirm";
import { TextArea } from "../../ui/textarea";
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
    unlimitedLength?: boolean;
    readonly?: boolean;
}

export function SingleInputColorDialog(p: IProps) {
    const [textValue, setTextValue] = useState("");
    const [collectionValue, setCollectionValue] = useState(p.dropdownValues?.[0] || "");
    const [colorValue, setColorValue] = useState<string | undefined>(undefined);

    const showDropdown = !!p.dropdownValues;

    useEffect(() => {
        setTextValue(p.initialText || "");
        setColorValue(p.initialColor);
    }, [p.initialColor, p.initialText, p.show]);

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
            className="dialog-content"
            onKeyPress={(e) => {
                if (e.charCode === 13 && !p.area) onConfirm();
            }}
        >
            <div className="dialog-caption">{p.caption}</div>
            <div>
                {p.area ? (
                    <TextArea
                        className="w-full af-input"
                        value={textValue}
                        onChange={(e) => {
                            if (p.readonly) return;
                            setTextValue(e.target.value);
                        }}
                        maxLength={p.unlimitedLength ? undefined : "500"}
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
                                className="w-full af-input"
                                value={textValue}
                                onChange={(e) => {
                                    setTextValue(e.target.value);
                                }}
                                maxLength="50"
                            />
                        </Form.Group>
                    </Form>
                )}
            </div>
            {!!p.showColors && (
                <div className="dialog-color-picker">
                    <ColorPicker value={colorValue} onPick={setColorValue} />
                </div>
            )}
        </div>
    );

    return <Confirm open={p.show} content={singleLabelDialogContent} onCancel={onCancel} onConfirm={onConfirm} />;
}
