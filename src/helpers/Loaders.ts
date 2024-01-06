import { api } from "../api/client";
import { Ntlm } from "../lib/ntlm";
import { appErrorSet } from "../redux/actions/appActions";
import { getListsSelector } from "../redux/selectors/settingsSelectors";
import { store } from "../redux/store";
import { s } from "../values/Strings";
import Differences from "./Differences";
import Lists from "./Lists";
import Query, { IQuery, IResponseQuery, IResponseQueryWI } from "./Query";
import { Stats, UsageStat } from "./Stats";
import WorkItem, { IResponseWorkItem, IWorkItem } from "./WorkItem";

const queryLoadingCounts: Record<string, number> = {};

export default class Loaders {
    private static auth: boolean = false;
    public static outage: boolean = false;

    // public static async loadCollectionsAndProjects() {
    //     // const cols = (await this.asyncRequest(
    //     //     "_api/_common/GetJumpList?showTeamsOnly=false&__v=5&navigationContextPackage={}&showStoppedCollections=false",
    //     // )) as any;
    //     // console.log("🚀 ~ file: Loaders.ts:23 ~ Loaders ~ loadCollectionsAndProjects ~ cols:", cols);

    //     // const collections = (cols.__wrappedArray || []).map((x: any) => x.name);

    //     // const projects: IProject[] = (cols.__wrappedArray || []).flatMap((col: any) =>
    //     //     col.projects.map((prj: any) => ({
    //     //         name: prj.name,
    //     //         path: prj.path,
    //     //         collectionName: prj.collectionName,
    //     //         enabled: true,
    //     //     })),
    //     // );

    //     const colls = await api.collection.getAll();

    //     const collections = colls.map((col) => col.name);
    //     const projects = colls.flatMap((x) => x.projects);

    //     return { collections, projects } as { collections: string[]; projects: IProject[] };
    // }

    // public static async loadPullRequests(projects: IProject[]) {
    //     if (!projects.length) return [];

    //     const promises = projects.map((p) =>
    //         this.asyncRequest(`${p.collectionName}/${p.name}/_apis/git/pullrequests?api-version=5`),
    //     );

    //     const result = await Promise.all(promises);

    //     const allPRs: IResponsePullRequest[] = result.reduce<IResponsePullRequest[]>(
    //         (prev: any, curr: any, index: number) => [
    //             ...prev,
    //             ...curr.value.map((x: any) => ({ ...x, _collection: projects[index].collectionName })),
    //         ],
    //         [],
    //     );

    //     const finalPRs = allPRs.map(PullRequest.buildFromResponse);

    //     finalPRs.sort((a, b) => b.id - a.id);

    //     return finalPRs;
    // }

    // public static async loadAvailableQueries() {
    //     const queries: IQuery[] = [];
    //     try {
    //         const collections = (await api.collection.getAll()).map((x) => x.name); // this.loadCollectionsAndProjects();

    //         for (let c in collections) {
    //             let r = (await this.syncRequest(collections[c] + "/_api/_wit/teamProjects?__v=5")) as any;
    //             // eslint-disable-next-line
    //             if (!r.projects) throw s("throwNoTeams");

    //             let teams = r.projects as ITeam[];
    //             //for each of project we need to load favs
    //             for (let x in teams) {
    //                 let res = (await this.syncRequest(
    //                     collections[c] + "/" + teams[x].guid + "/_apis/wit/queries?$depth=2&api-version=5.1",
    //                 )) as any;
    //                 res = res.value || [];
    //                 const children = res.flatMap((rf: any) => rf.children || []);
    //                 const all = [...res, ...children].filter((f) => !f.isPublic && !f.isFolder);

    //                 const favs = all.map((a: any) => ({ queryItem: a }));
    //                 favs.forEach((f) => {
    //                     queries.push(Query.buildFromResponse(f, teams[x], collections[c]));
    //                 });
    //             }
    //         }
    //     } catch (ex: any) {
    //         Stats.increment(UsageStat.NetworkFailures);
    //         store.dispatch(appErrorSet(ex));
    //     }
    //     return queries;
    // }

    public static async loadQueryWorkItems(query: IQuery) {
        let wis: IWorkItem[] = [];

        try {
            let preparedWIs: IResponseQueryWI[] = [];
            if (query.queryId !== "___permawatch") {
                let queryInfo = (await this.asyncRequest(
                    query.collectionName + "/" + query.teamId + "/_apis/wit/wiql/" + query.queryId + "?api-version=1.0",
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
                const permawatchList = getListsSelector("permawatch")(store.getState());
                preparedWIs = permawatchList.map((x) => ({ id: x.id, url: "", collection: x.collection }));
            }

            let qwi = preparedWIs;

            for (let x in qwi) {
                //check if WI is in hidden list. If yes, stop loading 4 of 5 times
                if (
                    Lists.isIn("hidden", qwi[x].collection || query.collectionName, qwi[x].id) &&
                    this.isNeedToStopLoadHiddens(query.queryId)
                ) {
                    continue;
                }

                let wi = (await this.asyncRequest(
                    (qwi[x].collection || query.collectionName) + "/_apis/wit/workItems/" + qwi[x].id,
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

            this.incrementQueryLoadingCounter(query.queryId);
        } catch (ex: any) {
            Stats.increment(UsageStat.NetworkFailures);
            store.dispatch(appErrorSet(ex));
        }

        return wis;
    }

    public static async checkCredentials() {
        try {
            //await this.asyncRequest("_api/_wit/teamProjects?__v=5", true);
            await api.collection.getAll(); //this.loadCollectionsAndProjects();
            return true;
        } catch (ex: any) {
            return false;
        }
    }

    public static async checkTfsPath() {
        try {
            let res = await fetch(store.getState().settings.tfsPath);
            if (res.status !== 401 && res.status !== 200) return false;
            else return true;
        } catch (ex: any) {
            return false;
        }
    }

    private static async asyncRequest(subpath: string, forceAuth?: boolean) {
        return new Promise(async (resolve, reject) => {
            const settings = store.getState().settings;
            let [domain, user] = settings.tfsUser.split("\\");
            Ntlm.setCredentials(domain, user, settings.tfsPwd);
            var url = settings.tfsPath + subpath;

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
            } catch (e: any) {
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
            const settings = store.getState().settings;
            let [domain, user] = settings.tfsUser.split("\\");
            Ntlm.setCredentials(domain, user, settings.tfsPwd);

            var url = settings.tfsPath + subpath;

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
            } catch (ex: any) {
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

    private static isNeedToStopLoadHiddens(queryId: string) {
        return (queryLoadingCounts[queryId] || 0) % 5 !== 0;
    }

    private static incrementQueryLoadingCounter(queryId: string) {
        if (!queryLoadingCounts[queryId]) queryLoadingCounts[queryId] = 0;
        queryLoadingCounts[queryId] += 1;
    }
}
