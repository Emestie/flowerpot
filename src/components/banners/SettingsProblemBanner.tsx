import { useState } from "react";
import Platform, { PlatformType } from "../../helpers/Platform";
import { useAppStore } from "../../zustand/app";
import { Button } from "../../ui/button";
import { Message } from "../../ui/message";
import { s } from "../../values/Strings";

/**
 * Reports how the settings file was loaded, unlike ActionBanner which is for
 * one-time promotional messages. Shown while the file is not healthy, on every
 * launch, and never stored in `bannersShown`.
 */
export function SettingsProblemBanner() {
    const status = useAppStore((state) => state.settingsStatus);
    const [hidden, setHidden] = useState(false);

    if (!status || status.ok || hidden) return null;

    const restored = status.recoveredFrom !== null;
    const locked = !restored && status.readOnly;

    const showFile = () => {
        Platform.current.showSettingsFile(restored || locked ? "settings" : "backup");
    };

    return (
        <Message negative={!restored} warning={restored} size="mini">
            {restored ? s("settingsRestoredBanner") : locked ? s("settingsLockedBanner") : s("settingsDamagedBanner")}
            <span style={{ marginLeft: 10 }}>
                {Platform.type === PlatformType.Electron && (
                    <Button compact size="mini" onClick={showFile}>
                        {s("settingsShowFile")}
                    </Button>
                )}
                <Button compact size="mini" onClick={() => setHidden(true)}>
                    {s("hideBanner")}
                </Button>
            </span>
        </Message>
    );
}
