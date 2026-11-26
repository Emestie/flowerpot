---
name: Local web UI check
description: Verify a Flowerpot UI or CSS change against real Azure DevOps data by serving the web build locally, seeding the installed app's settings into localStorage, checking computed styles in the live DOM and capturing a screenshot. Use for visual proof of work item / pull request styling, themes and color schemes that unit tests cannot cover.
---

# Local web UI check

Verifies a renderer change in the web build with the **real accounts, queries and work items** of the
locally installed Electron app, then captures a screenshot for the user. Everything stays local:
no commit, no deploy, no test data invented.

Use it when a change is visual (row styling, borders, colors, layout, themes/schemes) and the proof
has to be a screenshot of the actual app with actual data.

## Preconditions

- Flowerpot is installed and configured for the current Windows user:
  `%APPDATA%\flowerpot\settings.json` exists and has a `flowerpot` entry.
- The machine can reach the account's Azure DevOps host **with a valid TLS certificate**. The web
  build calls the API directly, so a self-signed cert that Electron tolerates will fail in Chrome.
- A `chrome-devtools` page is available. The in-app `browser` tools are not present in every client;
  `chrome-devtools` works through the desktop Chrome.

## Workflow

### 1. Build the renderer

```powershell
npm run build:renderer
```

This runs `tsc` (fix type errors first, they block the build) and writes `build/`, which is
`.gitignore`d.

Verify on the production build: it is what the PWA ships and it has no HMR noise.

`npm run web` can fail with a `400` websocket handshake and `Invalid hook call` /
`Cannot read properties of null (reading 'useEffect')` in `CollapsibleBlock`. That is not React
misbehaving: the app used to register its PWA service worker on `localhost` as well, and the
worker's cache-first handler replayed an older session's Vite modules and `/@vite/client` (with its
old HMR token) on the next run. `src/index.tsx` now skips registration on a dev host and removes an
existing worker together with its caches, so a fixed build heals the origin on its first load. If
the symptom is still there, check `navigator.serviceWorker.getRegistrations()` and unregister.

### 2. Seed the installed settings

```powershell
pwsh -File .opencode/skills/local-web-ui-check/scripts/write-seed.ps1
```

It writes `build/__verify-seed.json` (the exact `localStorage["@settings"]` shape the web build
reads) and prints only counts: accounts, enabled queries/projects, theme, scheme, locale. It never
prints PATs. The file lives in `build/` on purpose, so it cannot be committed by accident.

### 3. Serve the build

```powershell
npx vite preview --port 5010 --strictPort
```

Run it in the background. `vite preview` serves `build/`, including `/__verify-seed.json`.

### 4. Seed the browser and open the main view

`Platform.isDev()` is `true` on localhost, so a bare page load lands on `#/debug`. Open the main
view explicitly.

```js
// 1) navigate to http://localhost:5010/ and evaluate:
async () => {
    const seed = await fetch("/__verify-seed.json").then((r) => r.json());
    localStorage.setItem("@settings", JSON.stringify(seed));
    return JSON.stringify(seed).length;
}
```

```text
// 2) navigate to a URL with a CHANGING QUERY STRING:
http://localhost:5010/?seeded=1#/main
```

A hash-only navigation (`/#/main` after `/`) does **not** reload the document, so the app keeps its
empty in-memory state. Change the query string (or reload) to make `Settings.read()` run again.

### 5. Wait for real data, then pick the target

`wait_for` any caption of an enabled query from the seed (or a work item id you expect). Headers
render before the loaders finish, so confirm rows exist before measuring:

```js
() => ({
    rows: document.querySelectorAll("tr .wi-promptness").length,
    blocks: [...document.querySelectorAll(".collapsible-header")].map((h) => h.innerText.split("\n")[0]),
})
```

Blocks saved as collapsed in the user's settings stay collapsed (`collapsedBlocks` inside the
seeded `flowerpot` string). Either click a block header or clear the array in the seed and reload
with a new query string.

### 6. Collect evidence from the live DOM

Prefer computed styles over pixels: compare the changed element against a neighbour and the CSS
variable it should use. Example for the priority 1 (`.negative`) row border:

```js
() => {
    const ID = "225115"; // any visible work item id
    const rows = [...document.querySelectorAll("tr")].filter((r) => r.querySelector(".wi-promptness"));
    const target = rows.find((r) => r.innerText.includes(ID));
    const i = [...target.parentElement.children].indexOf(target);
    const prev = target.parentElement.children[i - 1];
    const td = target.querySelector("td");
    return {
        target: getComputedStyle(td).borderTopColor,
        previousRow: prev && getComputedStyle(prev.querySelector("td")).borderTopColor,
        tableBorder: getComputedStyle(document.documentElement).getPropertyValue("--table-border"),
        firstInTable: i === 0,
    };
}
```

`firstInTable: true` explains a `0px` top border: every table's first row has `border-top: none`
by design, so use a row that has a previous sibling.

### 7. Screenshot and crop

`resize_page` to a desktop size first (e.g. 1500×950), scroll the target into view, then
`take_screenshot` for the page id from `list_pages`, with an absolute `filePath` in
`%TEMP%\opencode`.

Crop to the rows that matter (target + one neighbour above and below) so the comparison is visible:

```powershell
pwsh -File .opencode/skills/local-web-ui-check/scripts/crop-screenshot.ps1 `
    -InputPath "$env:TEMP\opencode\shot.png" `
    -OutputPath "$env:TEMP\opencode\cropped.png" `
    -X 0 -Y 464 -Width 1500 -Height 127
```

Pass geometry from the page in **CSS pixels**; the script multiplies by `devicePixelRatio`
(usually 1.5) and clamps to the image.

To check a dark theme or another scheme, add the classes to **both** `<html>` and the app root and
also patch the root inline background:

```js
() => {
    document.documentElement.classList.add("FlowerpotDarkTheme", "scheme-shire");
    const root = document.querySelector("#root > div");
    root.className = "FlowerpotDarkTheme scheme-shire";
    root.style.background = "#1b1c1d";
}
```

The scheme CSS variables are declared on both `html.scheme-x` and `.scheme-x`; the root div wins by
inheritance, so setting only `<html>` leaves light surfaces.

### 8. Clean up (always)

```powershell
pwsh -File .opencode/skills/local-web-ui-check/scripts/cleanup.ps1
```

Stops the preview server, deletes `build/__verify-seed.json`, and verifies the seed is gone. Then in
the browser: `localStorage.removeItem("@settings")` for `localhost:5010` and navigate the page to
`about:blank`, so the user's PATs do not linger in the shared Chrome profile.

Finish with `git status --short` — it must show only the intended source changes.

## Gotchas

- **`flowerpot` is a JSON string**, not an object. `@settings` is
  `{ windowDim, windowPos, autostart, locale, installationID, flowerpot }`, and `Settings.read()`
  calls `JSON.parse` on `flowerpot`.
- **`#/main` is required on localhost**; otherwise the app opens the debug view.
- **A PWA worker must never control a dev host.** Its cache-first handler freezes Vite modules from
  a previous session (symptoms: HMR `400`, "two React copies", `settingsStatus` oddities). Check
  `navigator.serviceWorker.getRegistrations()` and `caches.keys()`; the app now cleans both itself.
- **Hash-only navigation is not a reload.** Use a changing query string.
- **First row of every table has no top border.** Pick a row with a previous sibling.
- **Device pixel ratio** is usually 1.5 here; crop with CSS coordinates, not image pixels.
- **Web build = direct API calls.** No proxy. A certificate the desktop app ignores will break the
  page; check with `curl`/`Invoke-WebRequest` before blaming the UI.
- **Ordering.** Sorting by priority puts red rows together in `black hole`/`created by me`; that is
  usually the quickest place to find a priority 1 row.
- **Secrets.** Never echo `token`, `tfsToken` or the seed file; keep it in `build/` and delete it in
  cleanup.

## Files

- `scripts/write-seed.ps1` — builds `build/__verify-seed.json` from `%APPDATA%\flowerpot\settings.json`.
- `scripts/crop-screenshot.ps1` — crops a screenshot using CSS-pixel coordinates and DPR.
- `scripts/cleanup.ps1` — removes the seed and stops local servers on 5009/5010.
