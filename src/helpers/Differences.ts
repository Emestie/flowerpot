import { IQuery, IWIStorage } from "./Query";
import { IWorkItem } from "./WorkItem";
import store from "../store";

export default class Differences {
    public static put(query: IQuery, workItems: IWorkItem[]) {
        if (!(window as any).wiStorage) (window as any).wiStorage = {};
        let wiStorage = (window as any).wiStorage as IWIStorage;
        if (!wiStorage[query.queryId]) {
            wiStorage[query.queryId] = store.copy(workItems);
            return;
        }
        let storage = wiStorage[query.queryId];
        let news: IWorkItem[] = [];
        let changed: IWorkItem[] = [];

        workItems.forEach(wi => {
            let stored = this.getWIById(storage, wi.id);
            if (!stored) {
                news.push(wi);
                return;
            }
            if (stored.rev !== wi.rev) {
                changed.push(wi);
            }
        });

        console.log(news, changed)
        if (store.settings.showNotifications) {
            news.forEach(n => {
                this.showNotif(this.createTitleForWI(n), "new");
            });

            changed.forEach(c => {
                this.showNotif(this.createTitleForWI(c), "change");
            });
        }

        wiStorage[query.queryId] = store.copy(workItems);
    }

    private static createTitleForWI(wi: IWorkItem) {
        let text = wi.title;
        let id = wi.id;
        let promptness = wi.promptness && wi.promptness < 3 ? `(${wi.promptnessText})` : "";
        let rank = wi.rank && wi.rank === 1 ? `(Rank 1)` : "";
        return `${promptness}${rank} ${id}: ${text}`;
    }

    private static getWIById(storage: IWorkItem[], id: number) {
        return storage.find(wi => wi.id === id);
    }

    private static showNotif(text: string, reason?: "new" | "change") {
        let title = "Flowerpot";
        if (reason) {
            if (reason === "new") title += ": new item";
            if (reason === "change") title += ": item changed";
        }
        new Notification(title, { body: text });
    }
}
