import { useState } from "react";
import { s } from "../../values/Strings";
import Platform from "../../helpers/Platform";
import { Message, Button } from "semantic-ui-react";
import { useAppStore } from "../../zustand/app";

export function UpdateBanner() {
    const updateStatus = useAppStore((state) => state.updateStatus);
    const [updateInstallInProgress, setUpdateInstallInProgress] = useState(false);

    const onUpdate = () => {
        setUpdateInstallInProgress(true);
        Platform.current.updateApp();
    };

    if (updateStatus === "ready")
        return (
            <Message positive>
                <Message.Header>{s("updateArrived")}</Message.Header>
                <p>
                    {s("updateArrivedText1")}{" "}
                    <Button compact positive size="tiny" loading={updateInstallInProgress} onClick={onUpdate}>
                        {s("install")}
                    </Button>{" "}
                    {s("updateArrivedText2")}
                </p>
            </Message>
        );
    else return null;
}
