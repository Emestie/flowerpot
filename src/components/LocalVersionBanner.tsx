import React from "react";
import { s } from "../values/Strings";
import Platform from "../helpers/Platform";

export function LocalVersionBanner() {
    if (Platform.current.isLocal())
        return (
            <span className="LocalVersion" title={s("localWarning")}>
                {s("localCaption")}
            </span>
        );
    else return null;
}
