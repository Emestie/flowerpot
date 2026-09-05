# FIX_PLAN.md — Flowerpot bugfix batches

Scope is limited to the issues listed below. Nothing else should be changed.
Each phase is self-contained so it can be executed in a separate agent run.
Verify each phase with the commands in its "Verify" section before moving on.

Repo facts (verified 2026-09-05):
- `TARGET_URL` appears only in `.env.development:3` and `AGENTS.md:167`. No code in `src/`, `host/`, `scripts/` reads it (`grep TARGET_URL` hits only those two files). Safe to delete.
- No service worker exists (`**/*service-worker*` → 0 hits). PWA = `public/manifest.json` (only 256px icon) + `firebase.json` (`public: build`, SPA rewrite) + Google Fonts via CDN in `index.html`.
- `MIGRATION_DENO.md` is a stale standalone doc (mentions Electron 19, removed deps). Nothing imports it.
- `@types/jest` is installed but there are 0 `*.test.*` / `*.spec.*` files and no jest/vitest/playwright config.

---

## Phase 1 — Renderer data safety + XSS (S5, C1, C2, C3, H1-renderer, H6, H10)

### S5 — XSS in `src/components/HighlightenText.tsx:12-17`
- Problem: `highlights` are regex-escaped but `text` (Azure work-item title) is interpolated raw into `__html`. `<img src=x onerror=...>` executes.
- Fix: drop `dangerouslySetInnerHTML`. Split `text` by the highlight regex and return React nodes (`<span>` + `<span className="marked">`). Escape path must cover `text`, not just the pattern.
- Files: `src/components/HighlightenText.tsx`.
- Accept: title containing `<img src=x onerror=alert(1)>`, `<script>`, `<a href="javascript:">` renders as inert text; highlights still wrap case-insensitively; empty `highlights` path unchanged.

### C1 — `Lists.push()` wipes `keywords` (`src/helpers/Lists.ts:20`)
- Problem: `const lists = { deferred, permawatch, favorites, hidden, pinned, forwarded, [listName]: list } as any` omits `keywords`.
- Fix: preserve `keywords` (spread existing `useSettingsStore.getState().lists` or explicitly carry `keywords` through). Remove the `as any` if possible, or type as full lists object.
- Files: `src/helpers/Lists.ts`.
- Accept: push to any work-item list leaves `lists.keywords` untouched.

### C2 — Import validation `&&` → `||` (`src/views/containers/DialogsContainer.tsx:79`)
- Problem: `if (!parsedSettings.accounts && !Array.isArray(parsedSettings.accounts))` lets `{accounts:"foo"}` through, then `setSettings({accounts:"foo"})` corrupts the store.
- Fix: `||` (`!parsedSettings.accounts || !Array.isArray(parsedSettings.accounts)`). Additionally validate each account entry is an object before `setSettings`; keep the existing try/catch + alert path.
- Files: `src/views/containers/DialogsContainer.tsx`.
- Accept: `{accounts:"foo"}`, `{accounts:{}}`, non-object JSON all rejected with alert; valid export round-trips.

### C3 — Shared PR timer key (`src/hooks/usePullRequestsLoader.ts:9,44,57`)
- Problem: `PR_TIMER_KEY="pr-block-timer"` shared by every account block; each `routineStart`/cleanup does `Timers.delete(PR_TIMER_KEY)`, so N accounts thrash and only the last polls.
- Fix: key per account, e.g. `` `pr-block-timer-${accountId}` `` in both `routineStart` and the `useEffect` cleanup.
- Files: `src/hooks/usePullRequestsLoader.ts`.
- Accept: two enabled accounts poll independently; unmounting one does not stop the other.

### H1-renderer — Unguarded `JSON.parse`
- Problem: `src/components/App.tsx:76` (`WIChangesCollection`), `src/helpers/Query.ts:90,100` (`WIStorage`/`PRStorage`), `src/helpers/platforms/web/WebStore.ts:22` (`@settings`) throw on corrupt data; App boot path bricks render. Only `Settings.ts:97` is guarded.
- Fix: add shared `safeParse<T>(raw: string | null, fallback: T): T` helper (try/catch, return fallback, evict corrupt key, console.warn). Use it at all four call sites (+ keep `Settings.ts` behavior).
- Files: new helper (e.g. `src/helpers/safe-parse.ts`), `App.tsx`, `Query.ts`, `WebStore.ts`.
- Accept: corrupt values in each key boot to fallback instead of throwing.

### H6 — In-render side effects
- `src/components/work-items/WorkItemsBlock.tsx:167-168`: `workItems.sort(...)` mutates in render → change to `[...workItems].sort(...)`.
- `src/views/MainView.tsx:45-47,108-110`: `setTimeout(5000)` + `Platform.updateTrayIcon(4)` in render body → move to `useEffect` with cleanup.
- `src/components/CollapsibleBlock.tsx:47`: collapse-all toggles (`toggleCollapsedBlock`) instead of force-add → force-add on collapse-all; expand (clear-all) stays as is.
- Accept: no side effects during render; repeated renders stable; collapse-all idempotent.

### H10 — Unsafe model field access
- `src/models/work-item.ts:66,74,81-82`: `resp._links.html.href`, `resp.fields[...]` assumed present → guard with optional chaining + defaults; skip/flag partial `workitemsbatch` entries instead of throwing.
- `src/models/pull-request.ts:68-69`: `replace("refs/heads/","")` assumes prefix → guard (`startsWith` check or strip only if present).
- `src/helpers/Query.ts:36-42`: `find(...)!` spreads `undefined` if query deleted mid-flight → return early when not found.
- `src/helpers/Query.ts:55-68` `move()`: mutates array elements before copy → copy first, then swap.
- Accept: deleted/partial items and missing fields never throw; `toggleBoolean` on missing query is a no-op.

### Verify Phase 1
- `npm run build:renderer`
- Manual: XSS title test, keyword persistence after `Lists.push`, settings import with `{accounts:"foo"}`, two-account PR polling, corrupt `WIChangesCollection`/`WIStorage`/`PRStorage` boot test.

---

## Phase 2 — Renderer async robustness (H2, H3, H5, H7, H8, H9)

### H2 — `Timers.create` leaks on overwrite (`src/helpers/Timers.ts:4-14`)
- Fix: call `this.delete(id)` at the top of `create()` before `setInterval`.
- Accept: re-creating the same id never orphans an interval.

### H3 — New `createRoot` per remount (`src/index.tsx:11-24`)
- Fix: single root instance; reuse `root.render()` on `ErrorBoundary.onRemount` instead of creating a second root on `#root`.
- Accept: no React "multiple roots on same container" warning; no leaked listeners on remount.

### H5 — Unbounded notification/storage growth
- Problem: `src/helpers/Differences.ts:22-23,73-76,130-133` (`shownWI`/`shownPR` appended forever); `WI/PRStorage` in `localStorage` stores full model objects and grows with full history.
- Fix: cap in-memory dedupe sets (LRU, e.g. max 1000 ids, evict oldest); store minimal records (`{id, rev, changedDate}`-style) instead of full `WorkItem`/`PullRequest`; prune entries when their account/query is deleted.
- Files: `src/helpers/Differences.ts`, `src/helpers/Query.ts`, `src/zustand/data.ts`.
- Accept: long-running app memory/`localStorage` bounded; deleting an account/query drops its stored items.

### H7 — Unhandled rejections / stuck loading
- `src/views/SelectQueriesView.tsx:38-60`, `src/views/SelectProjectsView.tsx:33`: `Promise.all(accounts.map(...getAvailable()))` with no catch → one account failure leaves `isLoading=true` forever. Plus `setTimeout(...,50)` without cleanup (setState after unmount).
- Fix: `Promise.allSettled`, per-account error UI, `isLoading=false` in all paths; cleanup timeout on unmount (clearTimeout / mounted flag).
- Accept: single failing account shows error, other accounts still load; unmount during load causes no setState warning.

### H8 — Async races, no cancellation
- `src/hooks/useAvatar.ts:7-12`: async IIFE sets state after unmount or after `avatarUrl` changed (slow wins). Same overlapping-poll hazard in `useQueryLoader/load()`.
- `src/helpers/Connection.ts:13,19`: `(window as any)._conn` debug global + `.finally(singleton=null)` thundering-herd refetch.
- `src/modules/avatar/get-content.ts:14,39-43`: cache keyed by URL only (ignores token/accountId), never evicted on error; `blobToBase64` has no `onerror` → hangs forever on `FileReader` error.
- Fix: generation counter / `AbortController` + unmount cleanup in hooks; key avatar cache by `url+accountId`; evict on error; add `reader.onerror` reject; coalesce in-flight connection fetch instead of reset-on-finally; remove debug globals.
- Accept: rapid prop changes / unmount cause no stale writes; avatar errors reject instead of hanging; concurrent connection requests share one promise.

### H9 — Loader error mapping (`src/modules/api-client/loader.ts:19,38-43`)
- Problems: `replace(/^.*?\/tfs\//,"")` mangles non-TFS hosts; 403/500/429 fall through to `result.json()` → misleading `jsonParseError`; redundant `catch(e){throw e}`.
- Fix: strip only the known `tfsPath` prefix (no generic `/tfs/` rewrite); after fetch, if `!result.ok` throw `HTTP ${status}` except the mapped 401 (`unauthorized`, skipping `connectionData` as today) and 404 (`notFoundOrNoAccess`); remove redundant try/catch. `btoa(":"+token)` stays (PATs are ASCII).
- Accept: 403/500/429 surface as HTTP-status errors, not `jsonParseError`; non-TFS hosts untouched; 401/404 behavior unchanged.

### Verify Phase 2
- `npm run build:renderer`
- Manual: timer overwrite test, error-boundary remount, `SelectQueriesView` with one failing account, avatar rapid-change, loader against 403/500 stubs.

---

## Phase 3 — Electron main process (C4, C5, C6, H4, H11, debounce resize/move)

Constraint for C6: fix the broken write path + write storm only. Do NOT change PAT storage (stays plaintext, no `safeStorage` migration in this plan).

### C4 — Locale compare bug (`host/main/src/index.ts:118`)
- `locale === ru ? ru : en` compares string to object → always English.
- Fix: `locale === "ru" ? ru : en` (keep the `"auto" → "en"` mapping above it).
- Accept: RU locale shows the Russian update notification.

### C5 — `update-app` darwin fallthrough (`host/main/src/ipc-handlers.ts:30-37`)
- After darwin `close()` it still calls `autoUpdater.quitAndInstall()` with `autoDownload=false` → error dialog.
- Fix: `return` after the darwin branch.
- Accept: darwin `update-app` never reaches `quitAndInstall`.

### C6 — `Store.set` broken async write (`host/main/src/store.ts:53`)
- `fs.writeFileAsync` does not exist → every write throws `TypeError`, caught, falls back to sync write (works by accident + sync I/O per write).
- Fix: `fs.promises.writeFile(...).catch(() => fs.writeFileSync(...))`; keep schema/defaults/`installationID` logic unchanged; no encryption change.
- Combined with the debounce item below this also fixes the write storm.
- Accept: settings persist without throwing; no `TypeError` in main logs.

### H11 — Tray guard + `file://` URL + logging
- `ipc-handlers.ts:22` `update-icon-dot-only` has no `tray` guard (unlike `update-icon` above it) → early event calls `tray.setImage` on `undefined` (currently swallowed by empty catch in `functions.ts:54`). Fix: `if (!tray) return`.
- `main-window.ts:91` `new URL("../../build/index.html","file://"+__dirname)` breaks on Windows spaces/backslashes. Fix: `pathToFileURL(join(__dirname,"../../build/index.html")).toString()`.
- `functions.ts:10,23-31`: fragile `../../../build-resources/` + preload paths, empty `catch {}`. Fix: existence check + `console.error` instead of silent catch. Same for updater error handler (`index.ts:121-123` discards `err` → log it + include message in `update_error` payload if trivial).
- Accept: early `react-is-ready` causes no exception; packaged Windows path loads; missing resources log instead of silently failing.

### Debounce resize/move config writes (`host/main/src/window-on-handlers.ts:25-33` + `store.ts`)
- Problem: `resize`/`move` call `store.set` (disk write) on every pixel.
- Fix: debounce both handlers (~300ms, trailing edge); writes go through the fixed C6 path. No behavior change to `close → hide` logic.
- Accept: dragging/resizing produces O(1) writes after settle, final geometry still persisted.

### H4 — Update listeners / intervals cleanup (renderer side: `src/helpers/platforms/Electron.ts:85-122`)
- Cyclic `setInterval(1h)` never cleared; 5 `ipcOn` subscriptions with no removal; `StrictMode` double-mount duplicates them.
- Fix: `checkForUpdates` returns/stores the interval id with a matching clear; `initUpdateListeners` returns an unsubscribe function removing all 5 listeners; call it from the `App.tsx` boot effect cleanup.
- Accept: mount/unmount cycles leave exactly one interval and one listener set.

### Verify Phase 3
- `cd ./host/main && npx tsc --noEmit` (or `npm run build:main`)
- `npm run build` (main + preload + renderer)
- Manual: resize/move log shows debounced writes; RU locale notification; darwin update path code-read.

---

## Phase 4 — Config, PWA offline, hygiene (S6, `@types/jest`, H5-overflow none, `MIGRATION_DENO.md`)

### S6 — Remove internal `TARGET_URL`
- Delete line 3 (`TARGET_URL = https://msktfs.eos.ru:8443`) from `.env.development`. File keeps `VITE_LOCAL_DYNAMIC_CONTENT=1` (+ commented `VITE_USE_FISH`).
- Update `AGENTS.md:167`: remove the `and TARGET_URL` mention (line becomes `` `.env.development` sets `VITE_LOCAL_DYNAMIC_CONTENT=1` `` or equivalent).
- Do NOT touch `.env.development.local` (live PAT lives there; rotation is out of scope for this plan).
- Accept: `grep -r TARGET_URL . --exclude-dir=node_modules --exclude-dir=.git` returns nothing; `npm run dev` / `npm run web` still start (nothing read `TARGET_URL`).

### Remove `@types/jest`
- `npm remove @types/jest` (or manual `package.json` + lockfile update via `npm install`). No test files exist, no jest config exists, so nothing else references it.
- Leave `tsconfig.json` `exclude: [src/**/*.spec.ts, src/**/*.test.ts]` as is (harmless without a runner).
- Accept: `npm run build:renderer` passes; `grep -r "@types/jest" package.json package-lock.json` empty.

### Fix PWA offline
Current state: no service worker; `public/manifest.json` has only a 256px icon, `theme_color: #000000` mismatched with `background_color: #1b1c1d` and `index.html#theme-color`; fonts load from Google CDN (breaks offline); `firebase.json` serves `build/` with SPA rewrite and no caching headers.
- Manifest (`public/manifest.json`): add `start_url: "./"`, `scope: "./"`, `id: "./"`, `description`, `512x512` + `maskable` icons (generate 512 + maskable PNGs from existing `flower-256` source into `public/icons/`), align `theme_color` with `background_color` (`#1b1c1d`) and `index.html`.
- Service worker: add minimal offline SW (e.g. `public/sw.js` with precache of app shell + runtime cache for `dynamic-content/`, network-first for API, cache-first for fonts/icons) and register it from the renderer only when running as web/PWA (guard: skip when `window.eapi` / Electron is present). Keep scope consistent with `base: ""`.
- `firebase.json`: keep SPA rewrite; add `headers` section with long cache for hashed assets (`**/*.js`, `**/*.css`, icons) and `no-cache` for `/index.html`, `/manifest.json`, `/sw.js`.
- Fonts: keep CDN as primary but make SW cache the font CSS/files at runtime so second-visit offline works (full self-hosting is out of scope).
- Accept: Lighthouse PWA "installable" gaps closed (icons/start_url/scope); second visit with network off still renders the shell; `firebase deploy --only hosting` serves new manifest + SW; Electron build unaffected.

### Delete `MIGRATION_DENO.md`
- Delete the file. Verify no code/docs link to it (`grep -ri "MIGRATION_DENO\|Deno 2.9 Desktop"` → only history hits, if any).
- Accept: file gone; `npm run build` unaffected.

### Verify Phase 4
- `npm run build:renderer`
- `firebase hosting` dry check: `build/manifest.json`, `build/sw.js`, `build/icons/*` present after build.
- `grep -r TARGET_URL` clean; `grep -ri MIGRATION_DENO` clean (outside git history).
