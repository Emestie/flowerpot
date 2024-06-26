import { Icon } from "semantic-ui-react";
import { s } from "../values/Strings";

export function LoadingView() {
    return (
        <div style={{ textAlign: "center", paddingTop: 300 }}>
            <Icon name="circle notched" loading /> {s("apploading")}
        </div>
    );
}
