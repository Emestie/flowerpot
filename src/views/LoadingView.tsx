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
            <img width={128} height={128} src="/icons/flower-256.png" />
            <br />
            {s("apploading")}
        </div>
    );
}
