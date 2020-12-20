import React from "react";
import store from "../store";
import { Message } from "semantic-ui-react";
import { s } from "../values/Strings";
import Electron from "../helpers/Electron";
import { observer } from "mobx-react-lite";

const flowerbotImg = require("../assets/flowerbot-av-48.png") as string;

export default observer(() => {
    if (!store.showFlowerbotBanner) return null;

    const hideMessage = () => {
        store.showFlowerbotBanner = false;
    };

    const showNotes = () => {
        Electron.openUrl("https://emestie.github.io/flowerpot/bot");
        hideMessage();
    };

    return (
        <Message positive>
            <img style={{ position: "absolute", top: 8, left: 8, height: 32, width: 32, borderRadius: "50%" }} src={flowerbotImg}></img>
            <span style={{ marginLeft: 32 }}>
                {s("flowerbotBanner1")}
                <span className="LinkStyleButton" style={{ marginLeft: 5 }} onClick={showNotes}>
                    {s("flowerbotBanner2")}
                </span>
            </span>
        </Message>
    );
});
