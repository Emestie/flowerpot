import { IFestivalDescriptor } from "./Festival";

export namespace DynamicContent {
    const localUrl = "./dynamic-content/";
    const webUrl = "https://raw.githubusercontent.com/Emestie/flowerpot/public/dynamic-content/";

    export async function loadFestivalJson(forceLocal?: boolean): Promise<IFestivalDescriptor[]> {
        const isLocal = forceLocal || !!import.meta.env.VITE_LOCAL_DYNAMIC_CONTENT;

        const url = isLocal ? localUrl : webUrl;

        try {
            const data = await fetch(url + "festival.json");
            const festivalDescriptors = (await data.json()) as IFestivalDescriptor[];

            return festivalDescriptors.map(replaceDates).map((x) => prependUrls(x, url));
        } catch {
            console.log("DynamicContent: festival loading catched.");
            if (isLocal) return [];

            //if internet is not available try local
            return await loadFestivalJson(true);
        }
    }

    function replaceDates(festivalDescriptor: IFestivalDescriptor): IFestivalDescriptor {
        const currentYear = new Date().getFullYear();

        const replaced = (date: string) => date.replace("YEAR", currentYear.toString());

        return {
            ...festivalDescriptor,
            dateFrom: replaced(festivalDescriptor.dateFrom),
            dateTo: replaced(festivalDescriptor.dateTo),
        };
    }

    function prependUrls(festivalDescriptor: IFestivalDescriptor, url: string): IFestivalDescriptor {
        return {
            ...festivalDescriptor,
            icon: {
                ...festivalDescriptor.icon,
                path: url + festivalDescriptor.icon.path,
            },
        };
    }
}
