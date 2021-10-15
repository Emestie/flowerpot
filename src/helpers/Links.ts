import { settingsUpdate } from "../redux/actions/settingsActions";
import { store } from "../redux/store";

export interface ILinkItem {
    name: string;
    url: string;
    color?: string;
    order?: number;
}

export default class Links {
    public static add(link: ILinkItem) {
        const allLinks = store.getState().settings.links || [];
        const maxOrder = Math.max(...allLinks.map((x) => x.order || 0), 0);
        link.order = maxOrder + 1;

        this.updateStore([...allLinks, link]);
    }

    public static delete(link: ILinkItem) {
        const allLinks = store.getState().settings.links || [];
        const newLinks = allLinks.filter((x) => x !== link);

        this.updateStore([...newLinks]);
    }

    public static move(link: ILinkItem, direction: "up" | "dn") {
        const allLinks = (store.getState().settings.links || []).sort((a, b) => (a.order || 0) - (b.order || 0));

        allLinks.forEach((x, i) => (x.order = i * 2));

        const newOrder = (link.order || 0) + (direction === "up" ? -3 : 3);

        link.order = newOrder;

        this.updateStore([...allLinks]);
    }

    public static updateColor(link: ILinkItem, color: string | undefined) {
        const allLinks = store.getState().settings.links || [];
        link.color = color;

        this.updateStore([...allLinks]);
    }

    private static updateStore(links: ILinkItem[]) {
        store.dispatch(settingsUpdate({ links }));
    }
}
