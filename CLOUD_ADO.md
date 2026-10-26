# Azure DevOps Services (cloud) support — investigation & implementation plan

**Status:** investigation complete; **implementation landed on this branch** (see §9 for the change list).
**Last verified:**
- investigation probes: 2026-10-21 against `https://mstpwnz.visualstudio.com` using a PAT;
- deep-link / permission-probe follow-ups: 2026-10-21 (same org, same PAT).
**Target branch:** `m/cloud`

This document is the single source of truth for adding support for **Microsoft-hosted Azure DevOps
Services** (a.k.a. "ADO Services", `*.visualstudio.com` / `dev.azure.com/{org}`) to Flowerpot.
Today Flowerpot only supports **on-premises Azure DevOps Server / TFS** deployments, because its URL
model is built around a server root + a *collection* path segment
(`https://tfs:8080/tfs/CollectionName/...`).

Everything below was verified empirically against a live org with a real PAT, not inferred from
documentation.

---

## 1. TL;DR — the seven things that actually block cloud support

| # | Blocker | Required change |
|---|---|---|
| 1 | ADO Services answers an unauthenticated/invalid request with **302 → `*.vssps.visualstudio.com/_signin` → 203 `text/html`** instead of 401 | Send `X-TFS-FedAuthRedirect: Suppress` on every request; treat non-JSON responses as auth failures |
| 2 | `GET /_apis/projectCollections` returns a collection named **`mstpwnz`** (the org name), but that name is **not a valid URL path segment** — `/mstpwnz/_apis/...` → **404** | Model the cloud org as a collection whose path segment is **empty** (`""`); never use the returned `name` in URLs |
| 3 | `GET /_apis/wit/queries` **requires a project segment** — without it → **400** | Query list must be built as `/{projectGuid}/_apis/wit/queries` (the app already puts the project GUID there — it just needs the collection segment dropped) |
| 4 | `GET /_apis/identities` does **not exist** on `*.visualstudio.com` / `dev.azure.com` (404 on every api-version) — it lives on **`https://{org}.vssps.visualstudio.com`** | Route the identities calls to the `vssps` host and add `queryMembership=Direct` to the `descriptors=` form |
| 5 | Payloads contain **absolute URLs on foreign hosts** (`spsprodweu2.vssps.visualstudio.com`, `tfsprodweusu4.visualstudio.com`) | `loader()` must accept absolute URLs and not blindly prefix-strip |
| 6 | `connectionData` on the cloud returns `deploymentType: "hosted"` and only exposes the account when authenticated | Add `deploymentType` / `instanceId` to `IConnectionData`; use `deploymentType` as the authoritative cloud detector |
| 7 | The account URL the user types (`https://dev.azure.com/mstpwnz`) is **not** the host Azure DevOps emits in `href`s (always `*.visualstudio.com`) | Canonicalize cloud account URLs to `https://{org}.visualstudio.com/` |

Everything else (`teamProjects`, `wiql`, `workItems`, `workitemsbatch`, `workItemTypes`, `git/repositories`,
`git/pullrequests`, `Contribution/HierarchyQuery`) works **as-is** once the collection segment is empty.

---

## 2. How to re-run the probes

The probes below were run with PowerShell. The PAT is read from the **User-scope** environment
variable `ADO_MSTPWNZ_TOKEN` (it is *not* visible in the current process environment unless the
process is restarted, which is a common source of confusion):

```powershell
$t = [Environment]::GetEnvironmentVariable('ADO_MSTPWNZ_TOKEN','User')
$b = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$t"))
$h = @{
  Authorization       = "Basic $b"
  "X-TFS-FedAuthRedirect" = "Suppress"
  Accept              = "application/json"
}
Invoke-WebRequest -Uri "https://mstpwnz.visualstudio.com/_apis/connectionData" -Headers $h -UseBasicParsing
```

The auth header format is exactly what the app already uses
(`src/modules/api-client/loader.ts:23` → `Authorization: "Basic " + btoa(":" + token)`).

**Never commit the token.** It lives only in the user environment and in the Windows registry
(`HKCU:\Environment`), not in the repo.

---

## 3. Test account

| Property | Value |
|---|---|
| Org URL | `https://mstpwnz.visualstudio.com` |
| Alternate URL | `https://dev.azure.com/mstpwnz` |
| `deploymentType` | `hosted` |
| `instanceId` | `c85f8113-b9c2-4675-a524-34376bc05411` |
| `deploymentId` | `3dbbfbca-3f3a-b896-0b3a-ea9e2087c7ac` |
| Projects | 10 (`MySweetBot`, `eDzennik`, `any`, `Later`, `RAMTest`, `Soraka`, `GlassClock`, `BingDailyWallpaper`, `Legacy-Projects`, `BNTU-Studying`) |
| Git repos | 24 (`_apis/git/repositories` → 200) |
| Open PRs | 0 — PR *thread* endpoints could not be verified end-to-end |
| Authenticated user | `Valery Murashko`, `subjectDescriptor = msa.ODFjYzNjZDUtMDc4ZC03YzMzLTlmM2UtZTAwYjQxMDJhNWE1` |

---

## 4. Findings

### 4.1 Host / deployment detection

`GET /_apis/connectionData` returns:

```json
{
  "authenticatedUser": { "id": "...", "subjectDescriptor": "msa....", "providerDisplayName": "..." },
  "authorizedUser":   { ... },
  "instanceId":  "c85f8113-b9c2-4675-a524-34376bc05411",
  "deploymentId": "3dbbfbca-3f3a-b896-0b3a-ea9e2087c7ac",
  "deploymentType": "hosted",
  "locationServiceData": { "serviceOwner": "...", "defaultAccessMappingMoniker": "PublicAccessMapping", ... }
}
```

Notes:

* `deploymentType` is **`"hosted"`** on ADO Services; on-prem it is `"onprem"` (or absent).
  This is the most reliable detector — prefer it over host sniffing.
* `locationServiceData` on the cloud is **trimmed** compared to on-prem: with `?connectOptions=1`
  it carries `serviceOwner`, `accessMappings`, `defaultAccessMappingMoniker`, `lastChangeId`,
  `lastChangeId64`, `serviceDefinitions` — but **no `resourceAreas`** with per-service
  `locationUrl`. Don't rely on `locationServiceData.resourceAreas` for cloud URL discovery.
* `connectionData` is **public**: it answers without auth. Unauthenticated it reports
  `providerDisplayName: "Anonymous"` and `properties.Account.$value` =
  `System:PublicAccess;aaaa…`. Therefore a successful `connectionData` fetch is **not** proof of
  valid credentials — the credential check must look at the *shape* of the response.

**Host patterns to recognize as "ADO Services":**

| Form | Notes |
|---|---|
| `https://{org}.visualstudio.com/` | canonical; Azure DevOps always emits this host in `href`s |
| `https://dev.azure.com/{org}/` | alternative entry point; supported by the API, but **not** the host used in payload hrefs |
| `https://{org}.vssps.visualstudio.com/` | service host — **required** for the identities API (§4.9) |

### 4.2 Authentication

| Scenario | Without `X-TFS-FedAuthRedirect: Suppress` | With it |
|---|---|---|
| Valid PAT | 200 JSON | 200 JSON |
| Invalid PAT | **302** → `*.vssps.visualstudio.com/_signin` → **203 `text/html`** | **401** (empty body) |
| No auth | 302 → 203 HTML | 401 |

Without the header, the app's `loader()` would try `result.json()` on a `text/html` sign-in page,
fail to parse, and throw the misleading `jsonParseError` instead of `unauthorized`.

**Decision: send `X-TFS-FedAuthRedirect: Suppress` on every request** (harmless on-prem).

`WWW-Authenticate`/`X-TFS-FedAuthRedirect` are already advertised by ADO Services.

### 4.3 Collections — the crux

```
GET https://mstpwnz.visualstudio.com/_apis/projectCollections?$top=1000
→ 200
{
  "count": 1,
  "value": [
    {
      "id":   "c85f8113-b9c2-4675-a524-34376bc05411",
      "name": "mstpwnz",
      "url":  "https://mstpwnz.visualstudio.com/_apis/projectCollections/c85f8113-b9c2-4675-a524-34376bc05411",
      "avatarUrl": null
    }
  ]
}
```

The collection `name` is the **organization name**, and it is **not a URL path segment**:

```
GET https://mstpwnz.visualstudio.com/mstpwnz/_apis/wit/queries?$depth=2   → 404
GET https://mstpwnz.visualstudio.com/mstpwnz/_api/_wit/teamProjects?__v=5 → 404
GET https://mstpwnz.visualstudio.com//_api/_wit/teamProjects?__v=5         → 200  (double slash OK)
```

Meanwhile `collection.url` **echoes the request host**: requesting via `dev.azure.com/mstpwnz`
returns `url: "https://dev.azure.com/mstpwnz/_apis/projectCollections/{id}"`.

**Decision:** model an ADO Services org as a single synthetic collection whose **path segment is the
empty string** `""`, and **never** call `_apis/projectCollections` for cloud accounts. The app builds
every URL as `collectionName + "/" + …`, so an empty collection name yields exactly the working
URL shapes (`/_apis/…`, `/{projectGuid}/_apis/…`) — verified above.

Side effect to handle: `Project.path = collectionName + "/" + projectName` becomes `"/any"`, and
`Query.nameInList = collectionName + " / " + projectName + " / " + path` becomes `" / any / …"`.
Both need a cloud-aware formatter (leading separator dropped).

### 4.4 Projects

```
GET https://mstpwnz.visualstudio.com/_api/_wit/teamProjects?__v=5      → 200  (10 projects)
GET https://mstpwnz.visualstudio.com//_api/_wit/teamProjects?__v=5     → 200  (empty collection)
GET https://mstpwnz.visualstudio.com/mstpwnz/_api/_wit/teamProjects?__v=5 → 404
```

The response shape matches on-prem exactly (`projects[].id` = numeric team id, `.guid`, `.name`,
`.workItemTypes`, `.process`), so `src/modules/api-client/types/project.ts` needs **no** change.

`_apis/projects?api-version=7.1` also works and returns `id`/`name`/`description`/`state`/
`visibility`/`lastUpdateTime` — but the `_api/_wit/teamProjects` shape is richer and is what the app
already consumes.

### 4.5 Queries

| URL | Result |
|---|---|
| `GET /_apis/wit/queries?$depth=2&api-version=5.1` | **400** — project segment required |
| `GET /_apis/wit/queries?$depth=2` (no api-version) | **400** |
| `GET /{projectGuid}/_apis/wit/queries?$depth=2&api-version=5.1` | **200** ✔ |
| `GET /{projectName}/_apis/wit/queries?$depth=2&api-version=5.1` | **200** ✔ |
| `GET /{project}/_apis/wit/queries/{queryId}` | **200** ✔ (paste-a-query-link) |
| `GET /{project}/_apis/wit/queries/{folderGuid}` | **400** (folder GUID is not a query — same as on-prem) |

`api-version=5.1` and `7.1` behave identically here.

The app's `src/modules/api-client/loaders/query.ts:17` already builds
`collectionName + "/" + project.guid + "/_apis/wit/queries?$depth=2&api-version=5.1"` — with an empty
collection name that becomes exactly `/{projectGuid}/_apis/wit/queries?…` → **200**.

`query.ts:33` (paste-a-query-link) replaces `_queries/query` with `_apis/wit/queries`; on the cloud
the browser URL is `https://{org}.visualstudio.com/{project}/_queries/query/{guid}`, so the
replacement yields `https://{org}.visualstudio.com/{project}/_apis/wit/queries/{guid}` → **200** ✔.
The project-name extraction at `query.ts:40` (`urlToLoad.split("/_apis/").at(0)?.split("/").at(-1)`)
yields the project name — correct for the cloud as well.

### 4.6 WIQL

| URL | Result |
|---|---|
| `GET /{projectGuid}/_apis/wit/wiql/{queryId}?api-version=5.1` | **200** ✔ |
| `GET /{projectName}/_apis/wit/wiql/{queryId}?api-version=5.1` | **200** ✔ |
| `GET /_apis/wit/wiql/{queryId}?api-version=5.1` | **200** ✔ |
| `GET //_apis/wit/wiql/{queryId}?api-version=5.1` | **200** ✔ |
| `POST /_apis/wit/wiql?api-version=5.1` | **200** ✔ |

The app uses `collectionName + "/" + query.teamId + "/_apis/wit/wiql/" + queryId` where
`query.teamId === project.guid` (`src/models/query.ts:30`) → `/61ac…/_apis/wit/wiql/{id}` → **200** ✔.

`api-version=5.1` and `7.1` both work.

### 4.7 Work items

| URL | Result |
|---|---|
| `GET /_apis/wit/workItems/{id}?api-version=5.1` | **200** ✔ |
| `POST /_apis/wit/workitemsbatch?api-version=5.1` | **200** ✔ (body `{"ids":[…],"$expand":"links"}`) |
| `GET /{project}/_apis/wit/workitemtypes?api-version=7.1` | **200** ✔ (15 types) |
| `GET /{projectGuid}/_apis/wit/workItemTypes/User%20Story` | **200** ✔ (absolute `_links.workItemType.href`) |
| `PATCH /_apis/wit/workItems/{id}` | **not verified** — the PAT used has no write scope |

`work-item.ts:56,70,95` build `collection + "/_apis/wit/…"` where `collection` comes from the query's
collection name → with `""` these become `/_apis/wit/…` → **200** ✔.

`work-item-type.ts:15` passes the **absolute** `_links.workItemType.href` to `loader()`. On the cloud
that href is `https://mstpwnz.visualstudio.com/{projectGuid}/_apis/wit/workItemTypes/User%20Story`.
Because the account URL is `https://mstpwnz.visualstudio.com/`, the current prefix-strip in
`loader.ts:17` happens to produce the right relative URL — **but only for the `visualstudio.com`
host**, which is precisely why the account URL must be canonicalized (§4.10).

### 4.8 Git / pull requests

| URL | Result |
|---|---|
| `GET /_apis/git/repositories?api-version=7.1` | **200** ✔ (24 repos) |
| `GET /{projectName}/_apis/git/pullrequests?$top=10000&api-version=7.1` | **200** ✔ (`{"value":[],"count":0}`) |
| `GET /{projectGuid}/_apis/git/pullrequests?$top=10000&api-version=7.1` | **200** ✔ |
| `POST /_apis/Contribution/HierarchyQuery?api-version=5.0-preview.1` | **200** ✔ (empty stats provider) |
| `POST //_apis/Contribution/HierarchyQuery?api-version=5.0-preview.1` | **200** ✔ |
| `GET /_apis/git/pullrequests/{id}/threads?api-version=7.0` | **not verified** — org has no open PRs |

Repository `url`s use the **project GUID** as the path segment:
`https://mstpwnz.visualstudio.com/{projectGuid}/_apis/git/repositories/{repoId}`.

`pull-request.ts:19` builds `${p.collectionName}/${p.name}/_apis/git/pullrequests?…` → with an empty
collection name → `/{projectName}/_apis/git/pullrequests?…` → **200** ✔.
`pull-request.ts:70` builds `${collectionName}/_apis/Contribution/HierarchyQuery?…` → `//_apis/…` → **200** ✔.

### 4.9 Identities — different host (important)

The `_apis/identities` family **does not exist** on the org host:

```
GET https://mstpwnz.visualstudio.com/_apis/identities?api-version=7.1   → 404
GET https://mstpwnz.visualstudio.com/_apis/identities?api-version=6.0   → 404
GET https://mstpwnz.visualstudio.com/_apis/Identities?api-version=7.1   → 404
GET https://mstpwnz.visualstudio.com/_apis/useridentities?…             → 404
GET https://mstpwnz.visualstudio.com/_apis/graphProfile/Members?…        → 404
GET https://dev.azure.com/mstpwnz/_apis/identities?api-version=7.1       → 404
```

It lives on the **service host**:

```
GET https://mstpwnz.vssps.visualstudio.com/_apis/identities?api-version=7.1
    → 400  (route exists, parameters required)

GET https://mstpwnz.vssps.visualstudio.com/_apis/identities
      ?queryMembership=Direct
      &subjectDescriptors=msa.ODFjYzNjZDUtMDc4ZC03YzMzLTlmM2UtZTAwYjQxMDJhNWE1
      &api-version=7.0
    → 200 ✔   (returns memberOf[] with 22 group descriptors)

GET https://mstpwnz.vssps.visualstudio.com/_apis/identities
      ?queryMembership=Direct
      &descriptors=<comma-joined memberOf descriptors>
      &api-version=7.0
    → 200 ✔   (returns the groups, e.g. "[mstpwnz]\Project Collection Administrators")
```

Two gotchas:

1. **`queryMembership=Direct` is mandatory** on the `descriptors=` form. Without it the response is
   `200 {"count":1,"value":[null]}` — a silent null that would blow up `connection-data.ts:41`
   (`groups.map(x => x.providerDisplayName)`).
2. The `descriptors=` values must be the **`memberOf` descriptors**
   (`Microsoft.TeamFoundation.Identity;S-1-9-…`), not subject descriptors.

`src/modules/api-client/loaders/connection-data.ts:20,32` already uses exactly these two URL shapes
— **but** on the org host, where they 404. Only the host has to change.

### 4.10 Hosts appearing in payloads

ADO Services emits absolute URLs on **three different hosts**:

| Host | Where it appears |
|---|---|
| `https://mstpwnz.visualstudio.com/…` | `url`, `_links.*.href`, `_apis/projects`, `_apis/git/repositories`, `_links.workItemType.href` |
| `https://spsprodweu2.vssps.visualstudio.com/A519d8b55-d578-45a4-bb2d-e9ef893ee961/_apis/Identities/…` | `authenticatedUser.url`, `createdBy.url`, `lastModifiedBy.url`, `fields.System.AssignedTo.url` |
| `https://tfsprodweusu4.visualstudio.com/_apis/wit/workItemIcons/…` | work item type `icon.url` (display only, never fetched by the app) |

`loader.ts:17` does `url.startsWith(_tfsPath) ? url.slice(_tfsPath.length) : url` — for a URL on a
foreign host this produces a **garbage relative path** which is then prefixed with the account URL.
Result: a request to the wrong URL (404 → `notFoundOrNoAccess`).

Consequences:

* `loader()` must detect absolute URLs (`/^https?:\/\//i`) and use them **verbatim**.
* The account URL must be canonicalized to `https://{org}.visualstudio.com/` so that
  `_links.workItemType.href` prefix-stripping keeps working.
* `dev.azure.com/{org}` is a valid entry point, but if stored verbatim the account URL will not match
  the `visualstudio.com` hrefs → canonicalization is mandatory, not cosmetic.

### 4.11 CORS (PWA / web build)

```
OPTIONS https://mstpwnz.visualstudio.com/_apis/connectionData
  Access-Control-Allow-Origin:  *
  Access-Control-Allow-Methods: OPTIONS,GET,POST,PATCH,PUT,DELETE
  Access-Control-Allow-Headers: authorization,x-tfs-fedauthredirect,content-type
  Access-Control-Max-Age:       3600
```

The `X-TFS-FedAuthRedirect` header is explicitly allowed by the preflight → the web build can send it
from the browser without a proxy.

---

## 5. Gap analysis — current code vs. cloud requirements

| File / location | Current behaviour | Problem on ADO Services | Required change |
|---|---|---|---|
| `src/modules/api-client/loader.ts:19-26` | `fetch(tfsPath + url)` with only `Authorization` + `Content-Type` | invalid PAT → 203 HTML; `result.json()` throws → wrong error | add `X-TFS-FedAuthRedirect: Suppress`; detect `content-type: text/html` / non-JSON → `unauthorized` |
| `src/modules/api-client/loader.ts:17` | strips only the `account.url` prefix | absolute URLs on foreign hosts become garbage | accept absolute URLs verbatim; normalize the account URL |
| `src/modules/api-client/loader.ts:28` | maps only `401` → `unauthorized` | 203 HTML, 302, 407 not handled | broaden the auth-failure detection |
| `src/modules/api-client/loaders/collection.ts:9` | `GET _apis/projectCollections?$top=1000` | returns `name = "mstpwnz"`, unusable as a path segment | still called (it requires auth, so it doubles as the credential proof), but the response value is replaced with a single synthetic collection `name = ""` for cloud |
| `src/modules/api-client/loaders/project.ts:14` | `collection.name + "/_api/_wit/teamProjects?__v=5"` | `mstpwnz/…` → 404 | with `name = ""` → `//_api/…` → 200 ✔ (double slash tolerated) |
| `src/modules/api-client/loaders/project.ts:19` | passes `collections[index].name` into `Project` | would bake `"mstpwnz"` into `Project.path` | pass `""` for cloud |
| `src/modules/api-client/loaders/query.ts:17` | `collectionName + "/" + project.guid + "/_apis/wit/queries…"` | with `""` → `/{guid}/_apis/…` → 200 ✔ | only depends on #2 |
| `src/modules/api-client/loaders/query.ts:33,40` | paste-a-query-link, project name from URL | cloud URL shape matches | ok, but strip the `/tfs/` assumption |
| `src/modules/api-client/loaders/work-item.ts:22,56,70,95` | `collectionName + "/_apis/wit/…"` | with `""` → `/_apis/wit/…` → 200 ✔ | only depends on #2 |
| `src/modules/api-client/loaders/pull-request.ts:19,53,70` | `collectionName + "/" + …` | with `""` → 200 ✔ | only depends on #2 |
| `src/modules/api-client/loaders/connection-data.ts:20,32` | `_apis/identities` on the **org host** | **404** | route to `https://{org}.vssps.visualstudio.com`; add `queryMembership=Direct` to the `descriptors=` form |
| `src/modules/api-client/types/connection-data.ts` | `IConnectionData` has only `authenticatedUser` | no `deploymentType` to detect the cloud with | add `deploymentType`, `instanceId`, `authorizedUser` |
| `src/modules/api-client/loaders/work-item-type.ts:15` | `loader(absolute href)` | breaks on a non-matching host | fixed by absolute-URL support + URL canonicalization |
| `src/helpers/Loaders.ts:19` | `checkCredentials` → `api.collection.getAll()` | `projectCollections` on the cloud is auth-optional-ish and returns a bogus collection name | use `connectionData` + check the user is not `Anonymous` / `System:PublicAccess` |
| `src/helpers/Loaders.ts:29-34` | `checkPermissions` hits `_apis/projectCollections`, `_apis/wit/fields`, `_apis/git/repositories`, `_apis/connectionData` | all four probe URLs verified working on the cloud (2026-10-21) | keep the URLs, canonicalize the account URL and add `X-TFS-FedAuthRedirect: Suppress` |
| `src/helpers/Loaders.ts:73-92` | `getUserData` → `connectionData.get()` | the identities call inside 404s → whole thing throws | must survive a failed identities call (groups are optional) |
| `src/views/CredentialsView.tsx:82-98` | URL validation: must start with `http`, must end with `/`, min length 11 | `https://mstpwnz.visualstudio.com/` passes, but `dev.azure.com/mstpwnz/` also passes and is *not* canonical | accept cloud URLs, canonicalize before storing |
| `src/views/CredentialsView.tsx:187` | placeholder `http://tfs:8080/tfs/` | — | cloud example (`https://dev.azure.com/organization/`) + localized cloud hint |
| `src/views/CredentialsView.tsx:219` | "create PAT" link → `account.url + "_usersSettings/tokens"` | → `https://mstpwnz.visualstudio.com/_usersSettings/tokens` ✔ (verified) | keep, but use the canonical URL |
| `src/views/CredentialsView.tsx:208` | docs link → Microsoft Learn PAT page | on-prem wording | the same page covers ADO Services |
| `src/models/project.ts:16` | `path = collectionName + "/" + name` | `"/any"` | format without the leading separator for cloud |
| `src/models/query.ts:35` | `nameInList = collectionName + " / " + name + " / " + path` | `" / any / …"` | same |
| `src/components/dialogs/OpenByIdDialog.tsx:47-49` | `url.split("/tfs/").at(0) + "/tfs/"` | on-prem-only hack | cloud deep link: the account URL itself is the base — `https://{org}.visualstudio.com/_workitems/edit/{id}` redirects to the project-scoped form (verified 302 → 200) |
| `src/components/work-items/WorkItemsBlock.tsx:88` | `/_workItems?path=` deep link | the TFS `_workItems?path=` hub exists on the cloud only behind a redirect (verified 302 → `_queries?path=`) | cloud queries are opened by id: `https://{org}.visualstudio.com/{project}/_queries/query/{queryId}` (verified 200) |
| `src/helpers/Settings.ts:16-23` (`IAccount`) | `url` only | no cloud marker | not needed — every consumer derives cloud-ness from the URL host (`CloudAdo.isCloudUrl`) or `connectionData.deploymentType`, so no persisted flag was added |
| `src/helpers/Lists.ts` | list keys are `accountId` + `collection` + `id` | `""` collection for cloud | safe — `accountId` separates accounts, and the permawatch pseudo-project also uses `""` |
| `src/helpers/Migration.ts` | account migration hook (`migrationsDone`) | existing accounts have no cloud flag | no migration needed — cloud accounts can only be added by this feature; nothing in the app depends on a persisted cloud flag |
| `src/values/{en,ru,be}.ts` | — | — | new `credsCloudHint` string (cloud URL examples) |
| `src/models/pull-request.ts:80` | author detection compares `createdBy.descriptor` with the user's `subjectDescriptor` | on the cloud the two never match (`ClaimsIdentity;…` vs `msa./aad.…`) → "author" badge would never show | for `deploymentType === "hosted"` the identity id is compared instead (`createdBy.id === authenticatedUser.id`) |

---

## 6. Implementation plan

> **As implemented** — deviations from the plan below are marked in *italics*. Full change list in §9.

### Phase 1 — Detection & account model

1. **`src/modules/api-client/types/connection-data.ts`** — extend `IConnectionData`:
   `deploymentType?: "hosted" | "onprem"`, `instanceId?: string`,
   `authorizedUser?: IAuthenticatedUser`, `locationServiceData?: {...}`.
2. **New helper `src/helpers/CloudAdo.ts`** (kebab-case file naming per AGENTS.md):
   * `detectCloud(url: string): boolean` — host matches `*.visualstudio.com` or `dev.azure.com/{org}`;
   * `canonicalize(url: string): string` — `https://dev.azure.com/{org}/…` → `https://{org}.visualstudio.com/`;
   * `getVsspsHost(url: string): string` — `https://{org}.vssps.visualstudio.com/` (for identities);
   * `getOrgName(url: string): string`.
3. **`src/helpers/Settings.ts`** — add `deploymentType?: "hosted" | "onprem"` to `IAccount`
   (persisted in settings.json, so it survives restarts).
4. **`src/helpers/Migration.ts`** — back-fill `deploymentType` for existing accounts by host sniffing
   (or leave it `undefined` = on-prem).

### Phase 2 — URL building in `loader()`

5. **`src/modules/api-client/loader.ts`**
   * Always send `X-TFS-FedAuthRedirect: Suppress`.
   * Accept **absolute URLs** as-is (no prefix-strip, no re-prefix).
   * Prefix-strip against the canonical account URL only; fall back to `new URL(url, tfsPath)`.
   * Treat `401`, `203`, `302`-to-signin, and any `text/html` response as `unauthorized`.
   * Keep `404` → `notFoundOrNoAccess`.

   Note: `X-TFS-FedAuthRedirect` is a non-simple request header; the preflight already allows it (§4.11).

### Phase 3 — Collections, projects, identities

6. **`src/modules/api-client/loaders/collection.ts`** — for cloud accounts, **skip**
   `_apis/projectCollections` and return a single synthetic collection:
   `{ id: instanceId, name: "", url: <account url> }`.
   (Alternative: keep calling it but overwrite `name` with `""` — however skipping removes the
   dependency on its response shape entirely, which is the safer option.)
7. **`src/modules/api-client/loaders/project.ts`** — unchanged once the collection name is `""`:
   `"" + "/_api/_wit/teamProjects?__v=5"` → `//_api/_wit/teamProjects?__v=5` → 200 ✔.
   Consider normalizing the double slash (`//` → `/`) in `loader()` for cleanliness.
8. **`src/modules/api-client/loaders/connection-data.ts`** — for cloud accounts, build the identities
   URLs against `https://{org}.vssps.visualstudio.com/` and add `queryMembership=Direct` to the
   `descriptors=` call. Make the whole group-lookup block **non-fatal** (wrap in try/catch) — group
   names are cosmetic, and a failure must not break the credential check.
9. **`src/helpers/Loaders.ts`**
   * `checkCredentials` — verify via `connectionData` and assert the user is **not**
     `Anonymous` and `properties.Account.$value` does not start with `System:PublicAccess`.
     *As implemented: the existing `api.collection.getAll()` path is kept for cloud too —
     `_apis/projectCollections` requires authentication (verified 401 with a bogus PAT), so the
     current call already proves the token; the Anonymous pitfall never enters the flow.*
   * `checkPermissions` — replace/verify the probe URLs for the cloud
     (`_apis/wit/fields` and `_apis/git/repositories` were not verified on the cloud yet);
     add `X-TFS-FedAuthRedirect: Suppress`.
     *As implemented: all four probe URLs verified working on the cloud on 2026-10-21 — the URLs
     stayed, only the header was added (plus URL canonicalization).*
   * `getUserData` — tolerate a failed identities lookup.

### Phase 4 — UI, deep links, i18n

10. **`src/views/CredentialsView.tsx`**
    * Accept `https://{org}.visualstudio.com/` and `https://dev.azure.com/{org}/`;
      store the canonical form.
    * Update the placeholder / hint to mention the ADO Services URL.
    * Keep the "create PAT" link (`/_usersSettings/tokens` works on the cloud ✔).
11. **`src/components/dialogs/OpenByIdDialog.tsx`** — replace the `/tfs/` hack with a
    cloud-aware base-URL builder:
    * on-prem: `https://host/tfs/`
    * cloud: `https://{org}.visualstudio.com/`
12. **`src/components/work-items/WorkItemsBlock.tsx`** — emit the cloud deep link
    `https://{org}.visualstudio.com/{project}/_workitems?path=…`.
    *As implemented: the canonical `_queries/query/{queryId}` link is used instead — the
    `_workItems?path=` hub only exists behind a redirect on the cloud.*
13. **`src/models/project.ts` / `src/models/query.ts`** — format `path` / `nameInList` without the
    leading separator when the collection name is empty.
14. **Localization** — new strings in `src/values/en.ts`, `src/values/ru.ts`, `src/values/be.ts`
    (e.g. a cloud URL hint and a "Azure DevOps Services" account label).

---

* **`PATCH /_apis/wit/workItems/{id}` (change state) is unverified** — the test PAT has no write
  scope. The URL shape is the same as `GET`, so it should work, but it needs a write-scoped PAT to
  confirm.
* **`GET /_apis/git/pullrequests/{id}/threads` is unverified** — the test org has no open PRs.
  The URL shape mirrors the verified `git/pullrequests` route.
* ~~`_apis/wit/fields?$top=1` (used by `checkPermissions`) is unverified~~ — **resolved**: verified
  working on the cloud on 2026-10-21 (`fields`, `repositories?$top=1`, `projectCollections?$top=1`
  all 200 with a valid PAT).
* **Multiple collections in one account** — an ADO Services account is a single org, so a single
  empty-name collection is correct. On-prem accounts with several collections keep their current
  behaviour.
* **Azure DevOps Server (on-prem) with `deploymentType` missing** — the detector must default to
  on-prem when the field is absent.
* **`dev.azure.com` URLs** — supported as an entry point but canonicalized away; if the user has the
  org name in the path, the canonical form is `https://{org}.visualstudio.com/`.
* **Enterprise-managed `visualstudio.com` deployments** — the host pattern still matches; the
  `deploymentType` check is the authoritative one.

---

## 8. Effort estimate

| Phase | Scope | Files | Estimate |
|---|---|---|---|
| 1 | detection & account model | ~5 | 0.5 day |
| 2 | loader URL/auth handling | 1–2 | 0.5–1 day |
| 3 | collections / projects / identities / credential checks | ~6 | 1–1.5 days |
| 4 | UI, deep links, formatting, i18n | ~8 | 1–2 days |
| — | manual verification (Electron + PWA, add account, run queries, PRs, state change) | — | 0.5–1 day |

**Total: ~20 files, 3–5 working days.**

Suggested order of work: Phase 2 → Phase 1 → Phase 3 → Phase 4, because Phase 2 alone (the
`X-TFS-FedAuthRedirect` header) is what makes the rest of the investigation reproducible from the app.

---

## 9. Implementation change list (as landed on `m/cloud`)

| File | Change |
|---|---|
| `src/helpers/CloudAdo.ts` | **new** — `getOrgName` / `isCloudUrl` / `canonicalizeUrl` / `getVsspsUrl` / `getCollectionDisplayName` |
| `src/modules/api-client/loader.ts` | sends `X-TFS-FedAuthRedirect: Suppress`; absolute URLs pass through untouched; URLs joined via `joinUrl` (single slash, tolerates a base without the trailing slash); `401` / `203` / `text/html` → `unauthorized` |
| `src/modules/api-client/types/connection-data.ts` | optional `deploymentType` / `instanceId` / `deploymentId` / `authorizedUser` / `locationServiceData`; `properties.Account` optional + lowercase `account` key |
| `src/modules/api-client/types/pull-request.ts` | `createdBy.id` added |
| `src/modules/api-client/loaders/collection.ts` | takes `params`; the real `_apis/projectCollections` call is still made (it requires auth → doubles as the credential proof), but for cloud accounts the result is replaced with one synthetic collection `{ id: <org>, name: "", url: <account> }` |
| `src/modules/api-client/loaders/connection-data.ts` | takes `params`; identities calls go against `{org}.vssps.visualstudio.com` (`getVsspsUrl`, identity to on-prem org host); `queryMembership=Direct` added to the `descriptors=` form; group lookup wrapped in try/catch (non-fatal); null identities filtered |
| `src/modules/api-client/loaders/project.ts`, `create.ts` | call signatures updated for `params` |
| `src/helpers/Loaders.ts` | `checkCredentials` / `checkPermissions` / `getUserData` canonicalize the URL; `checkPermissions` sends the suppress header |
| `src/models/project.ts` | `path` omits the leading separator when the collection name is empty |
| `src/models/query.ts` | `nameInList` same |
| `src/models/pull-request.ts` | `authorId` captured; cloud author detection compares identity ids when `deploymentType === "hosted"` |
| `src/views/CredentialsView.tsx` | cloud URLs accepted without a trailing slash; `onCheck` stores the canonical URL; placeholder + localized cloud hint |
| `src/components/dialogs/OpenByIdDialog.tsx` | cloud: base = canonical account URL (`_workitems/edit/{id}` redirects server-side); on-prem logic preserved + fixed the `undefined` fallback bug; selector gate now accepts the empty cloud collection name |
| `src/components/work-items/WorkItemsBlock.tsx` | cloud: query opened via `/{project}/_queries/query/{queryId}`; block tooltip falls back to the org name |
| `src/components/CollectionSelector.tsx`, `src/components/tables/{Queries,Projects}SettingsTable.tsx`, `src/views/SelectProjectsView.tsx` | empty (cloud) collection names display the org name / no leading separator |
| `src/values/{en,ru,be}.ts` | new `credsCloudHint` string |

**Deliberately not done:** `IAccount.deploymentType` + migration — every consumer derives cloud-ness
from the URL host or `connectionData.deploymentType`, so there is nothing to persist.

**Still to do before release:** manual verification in the running app (add the `mstpwnz` account,
run query blocks, open deep links); `PATCH` work-item state change and PR threads need a
write-scoped PAT / an org with open PRs.

## 10. Test coverage (vitest, `src/__tests__`)

Run with `npm test` (watch: `npm run test:watch`); config in `vitest.config.ts` (jsdom globally,
react plugin; deliberately separate from `vite.config.ts`). `tsconfig.json` excludes
`src/__tests__` from the app typecheck.

| File | Covers |
|---|---|
| `cloud-ado.test.ts` | all five `CloudAdo` helpers: visualstudio.com / dev.azure.com / vssps / on-prem / invalid URLs, case-insensitivity, display-name fallback |
| `loader.test.ts` | `createLoader`: `joinUrl` single-slash joins (base with/without trailing slash), absolute URL passthrough, Basic-auth + suppress + content-type headers, PATCH/POST bodies, `401`/`203`/`text-html` → `unauthorized`, `connectionData` exemption, `404` → `notFoundOrNoAccess`, JSON passthrough, parse failures (`jsonParseError` / `HTTP <status>`) |
| `loader-groups.test.ts` | collection (cloud synthetic `{id: org, name: ""}` + on-prem passthrough), connection-data (vssps URLs, `queryMembership=Direct`, 15-per-chunk splitting, null filtering, non-fatal identities failure, on-prem base), project (`/_api/...` vs `/{collection}/_api/...`, model paths), query (`$depth=2` list with/without collection, `getByUrl` `_queries/query`→`_apis/wit/queries` rewrite + trailing-slash trim), work-item (wiql/workitemsbatch URLs and POST body, error 600288 query deletion, server-message errors, permawatch zero-query path, `getOne`, PATCH `updateState`), work-item-type (absolute href passthrough + caching) |
| `models.test.ts` | `Project.path` / `Query.nameInList` with empty vs real collection name; `PullRequest`: field mapping, `/_git/` + `/pullrequest/` URL rewrite, `authorId`, belonging via descriptor (on-prem) vs identity id (hosted), reviewer / team-group detection, no-connection-data case, `isAcceptedByMe` |
| `loaders-helper.test.ts` | `Loaders.checkCredentials` (dev.azure.com canonicalization visible in the fetch URL, on-prem passthrough, false on 401), `checkPermissions` (4 scope probes, suppress header, 401/403/errorCode → missing labels, network errors ignored), `getUserData` |
| `credentials-view.test.tsx` | cloud URL accepted without a trailing slash, canonical URL passed to `checkCredentials` and stored on the account, display name/descriptor saved, on-prem URL without trailing slash disables Validate, short token disables Validate, failed check state |
| `open-by-id-dialog.test.tsx` | cloud deep link `{org}.visualstudio.com/_workitems/edit/{id}` with the empty collection name, on-prem link derived from the work item `/tfs/` base, no-op without an id |
| `collection-selector.test.tsx` | auto-select reporting the empty cloud collection name, org-name display fallback, dropdown switch to the on-prem collection; `QueriesSettingsTable` / `ProjectsSettingsTable` org-name rows |
| `work-items-block.test.tsx` | external-link deep link: cloud `/{project}/_queries/query/{queryId}` vs on-prem `_workItems?path=` hub URL; rows render |
| `select-projects-view.test.tsx` | live loader chain against a stubbed fetch: cloud labels without a collection prefix, on-prem `Collection / Project` labels |

The tests also caught and fixed a bug: `OpenByIdDialog` built the cloud deep link with a double
slash (`...visualstudio.com//_workitems/edit/5`) because `canonicalizeUrl` keeps the trailing
slash — fixed by stripping it before appending the route.

---

## Appendix A — endpoint matrix (all verified 2026-10-21)

Legend: ✔ = 200 JSON · ✖ = error status.

| Endpoint | Result |
|---|---|
| `GET /_apis/connectionData` | ✔ `deploymentType: "hosted"` |
| `GET /_apis/connectionData?connectOptions=1&lastChangeId=-1&lastChangeId64=-1` | ✔ trimmed `locationServiceData` |
| `GET /_apis/projectCollections?$top=1000` | ✔ `name: "mstpwnz"` |
| `GET /_api/_wit/teamProjects?__v=5` | ✔ 10 projects |
| `GET //_api/_wit/teamProjects?__v=5` | ✔ (empty collection name) |
| `GET /mstpwnz/_api/_wit/teamProjects?__v=5` | ✖ 404 |
| `GET /_apis/projects?api-version=7.1` | ✔ 10 projects |
| `GET /_apis/wit/queries?$depth=2&api-version=5.1` | ✖ 400 (project required) |
| `GET /{projectGuid}/_apis/wit/queries?$depth=2&api-version=5.1` | ✔ |
| `GET /{projectName}/_apis/wit/queries?$depth=2&api-version=5.1` | ✔ |
| `GET /{project}/_apis/wit/queries/{queryId}` | ✔ |
| `GET /{project}/_apis/wit/queries/{folderGuid}` | ✖ 400 (not a query) |
| `GET /_apis/wit/wiql/{queryId}?api-version=5.1` | ✔ |
| `GET /{projectGuid}/_apis/wit/wiql/{queryId}?api-version=5.1` | ✔ |
| `GET /{projectName}/_apis/wit/wiql/{queryId}?api-version=5.1` | ✔ |
| `POST /_apis/wit/wiql?api-version=5.1` | ✔ |
| `GET /_apis/wit/workItems/{id}?api-version=5.1` | ✔ |
| `POST /_apis/wit/workitemsbatch?api-version=5.1` | ✔ |
| `PATCH /_apis/wit/workItems/{id}?api-version=5.1` | ? unverified (no write scope) |
| `GET /{project}/_apis/wit/workitemtypes?api-version=7.1` | ✔ 15 types |
| `GET /{projectGuid}/_apis/wit/workItemTypes/User%20Story` | ✔ |
| `GET /_apis/git/repositories?api-version=7.1` | ✔ 24 repos |
| `GET /{projectName}/_apis/git/pullrequests?$top=10000&api-version=7.1` | ✔ (0 PRs) |
| `GET /{projectGuid}/_apis/git/pullrequests?$top=10000&api-version=7.1` | ✔ (0 PRs) |
| `POST /_apis/Contribution/HierarchyQuery?api-version=5.0-preview.1` | ✔ |
| `GET /_apis/identities?api-version=7.1` (org host) | ✖ 404 |
| `GET /_apis/identities?…` (dev.azure.com) | ✖ 404 |
| `GET /_apis/identities?api-version=7.1` (vssps host) | ✖ 400 (params required) |
| `GET {org}.vssps.visualstudio.com/_apis/identities?queryMembership=Direct&subjectDescriptors=…&api-version=7.0` | ✔ |
| `GET {org}.vssps.visualstudio.com/_apis/identities?queryMembership=Direct&descriptors=…&api-version=7.0` | ✔ |
| `GET {org}.vssps.visualstudio.com/_apis/identities?descriptors=…&api-version=7.0` (no `queryMembership`) | ✔ but `value:[null]` — **must add `queryMembership=Direct`** |
| `OPTIONS /_apis/connectionData` (CORS preflight) | ✔ `allow-origin: *`, allows `authorization`, `x-tfs-fedauthredirect` |
| `GET /_apis/wit/fields?$top=1&api-version=5.1` | ✔ (checkPermissions `vso.work` probe) |
| `GET /_apis/git/repositories?$top=1&api-version=7.0` | ✔ (checkPermissions `vso.code` probe) |
| `GET /_apis/projectCollections?$top=1` | ✔ (checkPermissions `vso.project` probe) |
| `GET /_apis/connectionData` **with a bogus PAT** | 200 + `providerDisplayName: "Anonymous"`, `System:PublicAccess;…` — connectionData is public |
| `GET /_apis/projectCollections?$top=1000` **with a bogus PAT** | ✖ 401 — real auth proof for `checkCredentials` |
| `GET /{org}/_workitems/edit/{id}` (web route) | 302 → `/{project}/_workitems/edit/{id}` → 200 |
| `GET /{project}/_workItems?path=…&_a=query` (web route) | 302 → `/{project}/_queries?path=…&_a=query` |
| `GET /{project}/_queries/query/{queryId}` (web route) | 200 — canonical cloud query link |
| `GET /_usersSettings/tokens` (PAT management page) | 200 |
