import flower256 from "../assets/flower-256.png";
import { s } from "../values/Strings";

export function LoadingView() {
    return (
        <div
            style={{
                display: "flex",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <img width={128} height={128} src={flower256} />
            <br />
            {s("apploading")}
        </div>
    );
}
