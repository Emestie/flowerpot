import React, { useEffect, useState } from "react";
import { Confirm, Form } from "semantic-ui-react";
import Links from "../../helpers/Links";
import Notif from "../../helpers/Notif";
import { s } from "../../values/Strings";
import ColorPicker from "../ColorPicker";

interface P {
    show: boolean;
    onClose: (e?: any) => void;
}

export default (p: P) => {
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
            Notif.show(s("wrongCaptionOrUrl"));
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
        <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>{s("linkDialogCaption")}</div>
            <div>
                <Form>
                    <Form.Input
                        style={{ width: "100%" }}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                        maxLength="15"
                        className="af-input"
                        label={s("linkDialogNameLabel")}
                    />
                    <Form.Input
                        style={{ width: "100%" }}
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                        }}
                        maxLength="300"
                        label={s("linkDialogUrlLabel")}
                    />
                </Form>
            </div>
            <div style={{ marginTop: 10 }}>
                <ColorPicker value={color} onPick={setColor} />
            </div>
        </div>
    );

    return <Confirm open={p.show} content={content} onCancel={onCancel} onConfirm={onConfirm} />;
};
