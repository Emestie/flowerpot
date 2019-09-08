import store from "../store";
import { Ntlm } from "../lib/ntlm";
import Query, { IQuery, ITeam, IFavQuery } from "./Query";

export default class Loaders {
    public static async loadAvailableQueries() {
        let queries: IQuery[] = [];
        try {
            let r = (await this.request("_api/_wit/teamProjects?__v=5")) as any;
            if (!r.projects) throw "No available team projects found";

            let teams = r.projects as ITeam[];

            //for each of project we need to load favs
            for (let x in teams) {
                let rfavs = (await this.request(teams[x].guid + "/_api/_wit/queryFavorites?__v=5")) as any;
                if (!rfavs.myFavorites || !rfavs.myFavorites.length) continue;
                let favs = rfavs.myFavorites as IFavQuery[];

                favs = favs.filter(f => !f.queryItem.isFolder);

                favs.forEach(f => {
                    queries.push(Query.buildFromResponse(f, teams[x]));
                });
            }
        } catch (ex) {
            store.showErrorPage(ex);
        }
        return queries;
    }

    public static async loadQueryWorkItems() {
        //add loaded WI to (window as any).wiStorage (qId)
    }

    public static async checkCredentials() {
        try {
            await this.request("_api/_wit/teamProjects?__v=5");
            return true;
        } catch (ex) {
            return false;
        }
    }

    public static async checkTfsPath() {
        try {
            let res = await fetch(store.settings.tfsPath);
            if (res.status !== 401 && res.status !== 200) return false;
            else return true;
        } catch (ex) {
            return false;
        }
    }

    private static async request(subpath: string) {
        return new Promise((resolve, reject) => {
            let [domain, user] = store.settings.tfsUser.split("\\");
            Ntlm.setCredentials(domain, user, store.settings.tfsPwd);

            var url = store.settings.tfsPath + subpath;

            // * Research: maybe I can anth once
            try {
                if (!Ntlm.authenticate(url)) {
                    reject("Cannot authenticate with provided credentials, TFS path is not valid or network problems occured");
                }

                var request = new XMLHttpRequest();
                request.open("GET", url, false);
                request.send(null);

                resolve(JSON.parse(request.responseText));
            } catch (ex) {
                reject("Something went wrong during request processing");
            }
        });
    }
}
