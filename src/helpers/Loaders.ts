import store from "../store";
import { Ntlm } from "../lib/ntlm";
import Query, { IQuery, ITeam, IResponseQuery, IResponseQueryWI } from "./Query";
import WorkItem, { IWorkItem, IResponseWorkItem } from "./WorkItem";
import Differences from "./Differences";
import { s } from "../values/Strings";
import Lists from "./Lists";

export default class Loaders {
    private static auth: boolean = false;
    public static outage: boolean = false;

    public static async loadCollections() {
        const cols = (await this.asyncRequest(
            "_api/_common/GetJumpList?showTeamsOnly=false&__v=5&navigationContextPackage={}&showStoppedCollections=false"
        )) as any;

        const names = (cols.__wrappedArray || []).map((x: any) => x.name);
        return names;
    }

    public static async loadAvailableQueries() {
        let queries: IQuery[] = [];
        try {
            const collections = await this.loadCollections();

            for (let c in collections) {
                let r = (await this.syncRequest(collections[c] + "/_api/_wit/teamProjects?__v=5")) as any;
                // eslint-disable-next-line
                if (!r.projects) throw s("throwNoTeams");

                let teams = r.projects as ITeam[];
                //for each of project we need to load favs
                for (let x in teams) {
                    let res = (await this.syncRequest(collections[c] + "/" + teams[x].guid + "/_apis/wit/queries?$depth=2&api-version=5.1")) as any;
                    res = res.value || [];
                    const children = res.flatMap((rf: any) => rf.children || []);
                    const all = [...res, ...children].filter((f) => !f.isPublic && !f.isFolder);

                    const favs = all.map((a: any) => ({ queryItem: a }));
                    favs.forEach((f) => {
                        queries.push(Query.buildFromResponse(f, teams[x], collections[c]));
                    });
                }
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
                let queryInfo = (await this.asyncRequest(
                    query.collectionName + "/" + query.teamId + "/_apis/wit/wiql/" + query.queryId + "?api-version=1.0"
                )) as IResponseQuery;

                // eslint-disable-next-line
                if (!queryInfo) throw s("throwQueryLoading");

                if ((queryInfo as any) === "__query_was_deleted") {
                    Query.delete(query);
                    return [];
                }

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
                preparedWIs = store.getList("permawatch").map((x) => ({ id: x.id, url: "", collection: x.collection }));
            }

            let qwi = preparedWIs;

            for (let x in qwi) {
                let wi = (await this.asyncRequest(
                    (qwi[x].collection || query.collectionName) + "/" + "_apis/wit/workItems/" + qwi[x].id
                )) as IResponseWorkItem;
                if (!wi.id) {
                    Lists.deleteFromList("permawatch", qwi[x].id, qwi[x].collection || "");
                    continue;
                }

                if (Lists.isIn("hidden", qwi[x].collection || "", wi.id, wi.rev)) {
                    continue;
                }
                Lists.deleteFromList("hidden", wi.id, qwi[x].collection || "");

                if (!query.collectionName) query.collectionName = qwi[x].collection || "";
                
                wis.push(WorkItem.buildFromResponse(wi, query));
            }

            Differences.put(query, wis);
        } catch (ex) {
            store.showErrorPage(ex);
        }

        return wis;
    }

    public static async checkCredentials() {
        try {
            //await this.asyncRequest("_api/_wit/teamProjects?__v=5", true);
            await this.loadCollections();
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

    private static async asyncRequest(subpath: string, forceAuth?: boolean) {
        return new Promise(async (resolve, reject) => {
            let [domain, user] = store.settings.tfsUser.split("\\");
            Ntlm.setCredentials(domain, user, store.settings.tfsPwd);
            var url = store.settings.tfsPath + subpath;

            try {
                if (!this.auth || forceAuth) {
                    if (!Ntlm.authenticate(url)) {
                        this.outage = true;
                        //reject(s("throwAuth"));
                        // eslint-disable-next-line
                        throw "no auth";
                    } else {
                        this.auth = true;
                    }
                }

                let respFinal = await fetch(url);
                if (!respFinal.ok) {
                    if (respFinal.status === 404) {
                        resolve("__query_was_deleted");
                    }
                    console.log("Bad response", respFinal);
                    // eslint-disable-next-line
                    throw "Bad response";
                    //reject()
                }
                let json = await respFinal.json();

                resolve(json);
            } catch (e) {
                //if (!forceAuth) {
                this.syncRequest(subpath, true)
                    .then((x) => {
                        resolve(x);
                    })
                    .catch((v) => {
                        //reject(v);
                        this.syncRequest(subpath, true)
                            .then((x) => {
                                resolve(x);
                            })
                            .catch((q) => {
                                reject(q);
                            });
                    });
                // } else {
                //     this.outage = true;
                //     reject(s("throwUnknown"));
                // }
            }
        });
    }

    private static syncRequest(subpath: string, forceAuth?: boolean) {
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
                    this.syncRequest(subpath, true)
                        .then((x) => {
                            resolve(x);
                        })
                        .catch((v) => {
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
