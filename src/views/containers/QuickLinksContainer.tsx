import { Label, type TColor } from "../../ui/label";
import { LINKS_COUNT_LIMIT } from "../../helpers/Links";
import Platform from "../../helpers/Platform";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { useSettingsStore } from "../../zustand/settings";

export function QuickLinksContainer() {
    const links = useSettingsStore((state) => state.links) || [];
    const sortedLinks = [...links].sort((a, b) => (a.order || 0) - (b.order || 0));

    const openLink = (url: string) => {
        Platform.current.openUrl(url);
    };

    const addNew = () => {
        useAppStore.getState().setDialog("addLink", true);
    };

    const items = sortedLinks.map((x) => (
        <Label
            key={x.url}
            color={x.color as TColor}
            onClick={() => openLink(x.url)}
            size="mini"
            basic
        >
            {x.name}
        </Label>
    ));

    if (!items.length) {
        items.push(
            <span key="nolinkskey" className="no-links-placeholder">
                {s("noLinks")}
            </span>
        );
    }

    if (links.length < LINKS_COUNT_LIMIT) {
        items.push(
            <Label key="addlinkkey" onClick={addNew} size="mini">
                +
            </Label>
        );
    }

    return <div className="ql-container text-right">{items}</div>;
}
