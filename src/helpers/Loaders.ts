import store from "../store";
import { Ntlm } from "../lib/ntlm";
import Query, { IQuery, ITeam, IFavQuery, IResponseQuery, IResponseQueryWI } from "./Query";
import WorkItem, { IWorkItem, IResponseWorkItem } from "./WorkItem";
import Differences from "./Differences";
import { s } from "../values/Strings";
import Lists from "./Lists";

export default class Loaders {
    private static auth: boolean = false;
    public static outage: boolean = false;

    public static async loadAvailableQueries() {
        let queries: IQuery[] = [];
        try {
            let r = (await this.request("_api/_wit/teamProjects?__v=5")) as any;
            // eslint-disable-next-line
            if (!r.projects) throw s("throwNoTeams");

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

    public static async loadQueryWorkItems(query: IQuery) {
        let wis: IWorkItem[] = [];

        try {
            let preparedWIs: IResponseQueryWI[] = [];
            if (query.queryId !== "___permawatch") {
                let queryInfo = (await this.request(query.teamId + "/_apis/wit/wiql/" + query.queryId + "?api-version=1.0")) as IResponseQuery;

                // eslint-disable-next-line
                if (!queryInfo) throw s("throwQueryLoading");

                //query results can be tree
                if (queryInfo.queryType === "flat") preparedWIs = queryInfo.workItems;
                else {
                    if (queryInfo.workItemRelations) {
                        for (let x in queryInfo.workItemRelations) {
                            if (!queryInfo.workItemRelations[x] || !queryInfo.workItemRelations[x].target) continue;
                            preparedWIs.push(queryInfo.workItemRelations[x].target);
                        }
                    }
                }
            } else {
                preparedWIs = store.getList("permawatch").map(x => ({ id: x.id, url: "" }));
            }

            let qwi = preparedWIs;

            for (let x in qwi) {
                let wi = (await this.request("_apis/wit/workItems/" + qwi[x].id)) as IResponseWorkItem;
                if (!wi.id) {
                    Lists.deleteFromList("permawatch", qwi[x].id);
                    continue;
                }

                if (Lists.isIn("hidden", wi.id, wi.rev)) {
                    continue;
                }
                Lists.deleteFromList("hidden", wi.id);

                wis.push(WorkItem.buildFromResponse(wi));
            }

            Differences.put(query, wis);
        } catch (ex) {
            store.showErrorPage(ex);
        }

        return wis;
    }

    public static async checkCredentials() {
        try {
            await this.request("_api/_wit/teamProjects?__v=5", true);
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

    private static request(subpath: string, forceAuth?: boolean) {
        return new Promise((resolve, reject) => {
            let [domain, user] = store.settings.tfsUser.split("\\");
            Ntlm.setCredentials(domain, user, store.settings.tfsPwd);

            var url = store.settings.tfsPath + subpath;

            try {
                if (!this.auth || forceAuth) {
                    if (!Ntlm.authenticate(url)) {
                        this.outage = true;
                        reject(s("throwAuth"));
                    } else {
                        this.auth = true;
                    }
                }

                var request = new XMLHttpRequest();
                request.open("GET", url, false);
                request.send(null);

                resolve(JSON.parse(request.responseText));
            } catch (ex) {
                if (!forceAuth) {
                    this.request(subpath, true)
                        .then(x => {
                            resolve(x);
                        })
                        .catch(v => {
                            reject(v);
                        });
                } else {
                    this.outage = true;
                    reject(s("throwUnknown"));
                }
            }
        });
    }
}
