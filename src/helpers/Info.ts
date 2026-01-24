import { appViewSet } from "../redux/actions/appActions";
import { store } from "../redux/store";
import Platform from "./Platform";

export class Info {
    private static listenerDictionary: Record<string, () => void> = {
        "test1.md": () => {
            document.getElementById("testbutton")?.addEventListener("click", () => console.log("asdasd"));
            document.getElementById("testbutton2")?.addEventListener("click", () => {
                console.log("cd1");
                store.dispatch(appViewSet("info", { contentFileName: "test2.md" }));
            });
        },
        "test2.md": () => {
            document.getElementById("testbutton1")?.addEventListener("click", () => {
                console.log("cd2");
                store.dispatch(appViewSet("info", { contentFileName: "test1.md" }));
            });
        },
        "changelog.md": () => {
            document.getElementById("flowerpot-pwa-button")?.addEventListener("click", () => {
                Platform.current.openUrl("https://flowerpot-pwa.web.app");
            });
            document.getElementById("go-to-old-changelog")?.addEventListener("click", () => {
                store.dispatch(appViewSet("info", { contentFileName: "changelog-old.md" }));
            });
        },
        "changelog-old.md": () => {
            document.getElementById("go-to-new-changelog")?.addEventListener("click", () => {
                store.dispatch(appViewSet("info", { contentFileName: "changelog.md" }));
            });
        },
    };

    private static getFetchUrl(pageName: string) {
        return "./info-pages/" + pageName;
    }

    private static async fetchPage(pageName: string) {
        const url = this.getFetchUrl(pageName);

        return await fetch(url);
    }

    public static async getInfoText(pageName: string) {
        const page = await this.fetchPage(pageName);
        const text = await page.text();

        return text;
    }

    public static registerEventListeners(pageName: string) {
        const listeners = this.listenerDictionary[pageName];
        if (listeners) listeners();
    }
}
