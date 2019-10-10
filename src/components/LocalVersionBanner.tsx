import React from "react";
import { s } from "../values/Strings";
import Electron from "../helpers/Electron";

export default () => {
    if (Electron.isLocal())
        return (
            <span className="LocalVersion" title={s("localWarning")}>
                {s("localCaption")}
            </span>
        );
    else return null;
};
