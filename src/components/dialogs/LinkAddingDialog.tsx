import { useEffect, useState } from "react";
import { Form } from "../../ui/form";
import { Confirm } from "../../ui/confirm";
import Links from "../../helpers/Links";
import { s } from "../../values/Strings";
import ColorPicker from "../ColorPicker";

interface P {
    show: boolean;
    onClose: (e?: any) => void;
}

export function LinkAddingDialog(p: P) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [color, setColor] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (p.show) {
            const inp1 = document.querySelector(".af-input input");
            if (inp1) (inp1 as any).focus();
        }
    }, [p.show]);

    const onConfirm = () => {
        if (!name || !url || !url.startsWith("http")) {
            return;
        }

        Links.add({ name, url, color });
        onCancel();
    };

    const onCancel = () => {
        setColor(undefined);
        setName("");
        setUrl("");
        p.onClose();
    };

    const content = (
        <div className="dialog-content">
            <div className="dialog-caption">{s("linkDialogCaption")}</div>
            <div>
                <Form>
                    <Form.Input
                        className="w-full af-input"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                        maxLength="50"
                        label={s("linkDialogNameLabel")}
                    />
                    <Form.Input
                        className="w-full"
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                        }}
                        maxLength="300"
                        label={s("linkDialogUrlLabel")}
                    />
                </Form>
            </div>
            <div className="dialog-color-picker">
                <ColorPicker value={color} onPick={setColor} />
            </div>
        </div>
    );

    return <Confirm open={p.show} content={content} onCancel={onCancel} onConfirm={onConfirm} />;
}
