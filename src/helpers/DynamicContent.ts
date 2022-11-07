import { IFestivalDescriptor } from "./Festival";

export namespace DynamicContent {
    const localUrl = "./dynamic-content/";
    const webUrl = "https://raw.githubusercontent.com/Emestie/flowerpot/dynamic-content/";

    export async function loadFestivalJson(forceLocal?: boolean): Promise<IFestivalDescriptor> {
        const isLocal = forceLocal || !!import.meta.env.VITE_LOCAL_DYNAMIC_CONTENT;

        const url = isLocal ? localUrl : webUrl;

        try {
            const data = await fetch(url + "festival.json");
            const festivalDescriptor = (await data.json()) as IFestivalDescriptor;

            return replaceDates(festivalDescriptor);
        } catch {
            console.log("DynamicContent: festival loading catched.");
            if (isLocal) return { headerIcons: [] };

            //if internet is not available try local
            return await loadFestivalJson(true);
        }
    }

    function replaceDates(festivalDescriptor: IFestivalDescriptor): IFestivalDescriptor {
        const currentYear = new Date().getFullYear();

        const replaced = (date: string) => date.replace("YEAR", currentYear.toString());

        return {
            ...festivalDescriptor,
            headerIcons: festivalDescriptor.headerIcons.map((x) => ({
                ...x,
                dateFrom: replaced(x.dateFrom),
                dateTo: replaced(x.dateTo),
            })),
        };
    }
}
