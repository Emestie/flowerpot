import React from "react";
import { s } from "../values/Strings";

export function LoadingView() {
    return <div style={{ textAlign: "center", marginTop: 300 }}>{s("apploading")}</div>;
}
