import Platform from "../../helpers/Platform";
import { useAppStore } from "../../zustand/app";
import { Button } from "../../ui/button";
import { Message } from "../../ui/message";
import { s } from "../../values/Strings";

/**
 * Tells the user that the app is running without the Chromium sandbox because
 * the renderer crashed at startup. Unlike the promotional banners this is a
 * state of the app, so it stays visible while compatibility mode is on and
 * offers both the log file and a way back to the normal mode.
 */
export function CompatModeBanner() {
    const compatMode = useAppStore((state) => state.compatMode);

    if (!compatMode?.active) return null;

    return (
        <Message warning size="mini">
            {s("compatModeBanner")}
            <span style={{ marginLeft: 10 }}>
                <Button compact size="mini" onClick={() => Platform.current.showMainLog()}>
                    {s("compatModeShowLog")}
                </Button>
                <Button compact size="mini" onClick={() => Platform.current.disableCompatMode()}>
                    {s("compatModeTryNormal")}
                </Button>
            </span>
        </Message>
    );
}
