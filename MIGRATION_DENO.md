# Migration Plan: Electron → Deno 2.9 Desktop

## Overview

Migrate Flowerpot from **Electron 19** (Node.js + Chromium 102) to **Deno 2.9 Desktop** (released June 25, 2026). The React renderer, UI components, and Zustand state management stay largely unchanged; the native OS layer (window management, tray, notifications, clipboard, auto-update) is rebuilt on Deno's native desktop APIs.

---

## Current Architecture (Electron 19)

- **Renderer**: React 19 SPA, built by Vite 6 → `build/` directory
- **Preload**: `host/preload/src/` — `contextBridge.exposeInMainWorld()` + `ipcRenderer`
- **Main Process**: `host/main/src/` — 8 files (window mgmt, tray, IPC handlers, store, security, auto-updater, splash screen)
- **Bridge**: renderer imports `#preload` alias → calls `eapi.ipcSend/invoke/on` → main process handlers
- **Platform Abstraction**: `IPlatformClass` in `src/helpers/Platform.ts` with `ElectronPlatform`/`WebPlatform` implementations
- **Build**: 3 separate Vite builds (main, preload, renderer) + electron-builder for packaging
- **Dist**: `dist/` directory with `.exe` installers, published via GitHub releases with `electron-updater`

---

## Deno 2.9 Desktop Equivalents

| Electron API | Deno 2.9 Desktop |
|---|---|
| `BrowserWindow` | `Deno.BrowserWindow` |
| `Tray`, `nativeImage` | `Deno.Tray` |
| `Notification` | `new Notification()` (Web API → native) |
| `ipcMain.handle/on` + `ipcRenderer` | `win.bind(name, fn)` + `bindings.name()` |
| `contextBridge.exposeInMainWorld` | Not needed — `bindings` is auto-exposed |
| `clipboard.writeText/readText` | `navigator.clipboard` (from webview) |
| `shell.openExternal` | `Deno.Command` or `window.open()` |
| `app.setLoginItemSettings` | Not available — custom impl needed |
| `autoUpdater` (electron-updater) | `Deno.autoUpdate()` (bsdiff, macOS/Linux) |
| `app.requestSingleInstanceLock` | Not available — custom file lock |
| `globalShortcut` | `win.addEventListener("keydown", ...)` |
| `Menu`, `setApplicationMenu` | `win.setApplicationMenu()`, `win.showContextMenu()` |
| `dialog.showMessageBox` | `alert()`, `confirm()`, `prompt()` (native) |
| Splash screen (`@trodi/electron-splashscreen`) | Not needed — instant load from local server |
| `app.getPath("userData")` | `Deno.env.get("HOME")` / XDG paths |
| `electron-builder` | `deno desktop build` (built-in) |
| Devtools | `win.openDevtools()` |

---

## Migration Steps

### Phase 1 — Project Scaffolding & Configuration

1. **Create `deno.json`** at project root with:
   - `name`, `version`, `exports: "./desktop.ts"`
   - `desktop` block: `{ app, backend, output, release, errorReporting }`
   - `tasks`: `dev`, `build`, `web`

2. **Remove Electron-specific deps** from `package.json`:
   - Remove: `electron`, `electron-builder`, `electron-updater`, `@trodi/electron-splashscreen`, `unplugin-auto-expose`
   - Keep React/Vite/build deps
   - Keep runtime deps: `zustand`, `lodash`, `moment`, `markdown-to-jsx`, `semantic-ui-react`

3. **Create `desktop.ts`** (Deno desktop entrypoint, replaces all of `host/main/src/`):
   - Start `Deno.serve()` serving built React app from `build/`
   - Create `Deno.BrowserWindow` navigating to local server
   - Register all `win.bind()` handlers (settings, clipboard, notifications, tray, etc.)
   - Set up `Deno.Tray` with icon, tooltip, context menu
   - Set up application menu with `win.setApplicationMenu()`
   - Handle window geometry persistence (position/size)
   - Single instance lock via file-based mutex
   - Auto-update via `Deno.autoUpdate()`

4. **Update `vite.config.ts`**:
   - Remove `unplugin-auto-expose` and its config
   - Remove `#preload` alias from tsconfig paths
   - Update build target from `chrome${chrome}` to `esnext`

### Phase 2 — Replace Preload Bridge with Bindings

5. **Create shared type declaration** `types/bindings.d.ts`:
   ```ts
   interface Bindings {
     readSettingsProp(prop: string): Promise<unknown>;
     saveSettingsProp(prop: string, value: unknown): Promise<void>;
     openUrl(url: string): Promise<void>;
     getOsName(): string;
     isDev(): boolean;
     toggleDevtools(): Promise<void>;
     quitAndInstall(): Promise<void>;
     onUpdateStatus(listener: (status: string) => void): void;
     // ... all IPC channels
   }
   declare const bindings: Bindings;
   ```

6. **Create `src/helpers/platforms/Deno.ts`** implementing `IPlatformClass`:
   - Delegate to `bindings.*` calls
   - Clipboard → `navigator.clipboard.writeText/readText`
   - Notifications → `new Notification(...)` (Web API, native in Deno Desktop)
   - Update listeners → `bindings.onUpdateStatus(callback)`

7. **Update `src/helpers/Platform.ts`**:
   - Add `PlatformType.Deno`
   - Detection: `typeof bindings !== "undefined"` (auto-injected by Deno)
   - Route to `DenoPlatform` instance

8. **Remove `host/preload/` directory**.

### Phase 3 — Convert Main Process Logic to Deno

9. **Settings Store** (`desktop.ts`):
   - Read/write JSON file via `Deno.readTextFile/Deno.writeTextFile`
   - Path: `Deno.env.get("HOME") + "/.flowerpot/settings.json"`
   - Same schema as current `store.ts`

10. **Tray & Dock** (`desktop.ts`):
    - `Deno.Tray` with icon (read PNG bytes via `Deno.readFile`)
    - Context menu: Show/Quit + notification level submenu
    - `Deno.dock.setBadge()` for unread count
    - `tray.setTooltip()` for notification status

11. **Notifications** (`desktop.ts`):
    - Use Web `Notification` API (native in Deno Desktop)
    - `Notification.requestPermission()` on startup

12. **Clipboard**:
    - Use `navigator.clipboard` from webview side directly
    - Update `DenoPlatform.copyString()` to use `navigator.clipboard.writeText()`

13. **Shell/Open URL** (`desktop.ts`):
    - Use `new Deno.Command("open"/"xdg-open"/"start")` depending on platform
    - Or just `window.open(url)` from webview

14. **Auto-update** (`desktop.ts`):
    - Replace `electron-updater` with `Deno.autoUpdate()`
    - Host `latest.json` + bsdiff patches on GitHub releases

15. **Single Instance Lock** (`desktop.ts`):
    - Create a lock file (`~/.flowerpot/lock`) on startup
    - If it exists, focus existing window and exit
    - Clean up on graceful shutdown

16. **Global Shortcuts**:
    - Replace `globalShortcut.register(...)` with `win.addEventListener("keydown", handler)`

17. **Security Restrictions**:
    - Deno Desktop CEF/WebView doesn't offer fine-grained navigation blocking
    - Handle partially via `win.addEventListener("keydown")` and custom bindings

### Phase 4 — Dev Workflow & Build

18. **Dev mode**:
    - Start Vite dev server for React
    - Run `deno desktop --hmr desktop.ts` which auto-detects the Vite server
    - Deno Desktop HMR reloads webview on changes

19. **Build pipeline**:
    - `vite build` (builds React app to `build/`)
    - `deno desktop build desktop.ts` (produces binary with embedded web engine)
    - Cross-compilation: `deno desktop build --all-targets desktop.ts`

20. **Update `package.json` scripts**:
    - `dev`: `deno task dev`
    - `build`: `npm run build:renderer && deno task build`
    - `compile`: `npm run build:renderer && deno task build --output ./dist`

### Phase 5 — Cleanup & Remove Electron Artifacts

21. **Remove files/directories**:
    - `host/main/`
    - `host/preload/`
    - `.electron-builder.config.js`
    - `.electron-vendors.cache.json`
    - `scripts/watch.js`
    - `dist/` (old electron-builder output)

22. **Simplify `package.json`**:
    - Remove Electron-specific scripts
    - Keep only web-related scripts or move to `deno task`
    - Reduce devDependencies

---

## Renderer Side Changes

| Current (`ElectronPlatform` + `eapi`) | New (`DenoPlatform` + `bindings`) |
|---|---|
| `eapi.ipcInvoke("read-settings-prop", prop)` | `bindings.readSettingsProp(prop)` |
| `eapi.ipcSend("save-settings-prop", {prop, value})` | `bindings.saveSettingsProp(prop, value)` |
| `eapi.clipboardWriteText(s)` | `navigator.clipboard.writeText(s)` |
| `eapi.clipboardReadText()` | `navigator.clipboard.readText()` |
| `eapi.shellOpenExternal(url)` | `bindings.openUrl(url)` or `window.open(url)` |
| `eapi.ipcSend("show-notification", data)` | `new Notification(data.title, {body: data.body})` |
| `eapi.ipcSend("toggle-dev-tools")` | `bindings.toggleDevtools()` |
| `eapi.ipcSend("update-app")` | `bindings.quitAndInstall()` |
| `eapi.ipcOn("checking_for_update", ...)` | `bindings.onUpdateStatus(callback)` |
| `eapi.isDev` | `bindings.isDev()` |
| `eapi.platformName` | `bindings.getOsName()` |

---

## API Mapping: Main Process Files

| Electron file | Deno equivalent |
|---|---|
| `host/main/src/index.ts` | Top-level init in `desktop.ts` |
| `host/main/src/main-window.ts` | `new Deno.BrowserWindow({...})` |
| `host/main/src/window-on-handlers.ts` | `win.addEventListener("resize"/"move"/"close", ...)` |
| `host/main/src/functions.ts` | `new Deno.Tray()`, `new Notification()`, `Deno.dock.setBadge()` |
| `host/main/src/ipc-handlers.ts` | `win.bind("channelName", handler)` |
| `host/main/src/security-restrictions.ts` | Partially covered by CEF backend |
| `host/main/src/store.ts` | `Deno.readTextFile/Deno.writeTextFile` |

---

## Risks & Open Issues

| Issue | Impact | Mitigation |
|---|---|---|
| `Deno.autoUpdate()` Windows not supported | Windows users can't auto-update | Custom updater or manual download fallback |
| No native clipboard API from Deno side | Clipboard ops must happen in webview | `navigator.clipboard` sufficient in CEF/WebView |
| No `globalShortcut` equivalent | No global hotkeys when minimized | Use per-window key events; expose via tray |
| No `app.setLoginItemSettings()` | No "Run at startup" | Custom registry/LaunchAgent via `Deno.Command` |
| No single instance primitive | Multiple instances possible | File-based mutex |
| Deno 2.9 Desktop is experimental | API may change between patches | Pin Deno version, track changelog |
| CEF backend binary size (~100MB+) | Larger than Electron | Use WebView backend for smaller size |
| Existing Vite target `chrome102` | May not match Deno's webview | Change to `esnext` |

---

## Effort Estimate

| Phase | Scope | Estimated Effort |
|---|---|---|
| Phase 1 | Scaffolding, config, deps cleanup | 0.5-1 day |
| Phase 2 | Bindings bridge + DenoPlatform class | 1-1.5 days |
| Phase 3 | Main process logic in Deno | 2-3 days |
| Phase 4 | Dev workflow + build pipeline | 0.5-1 day |
| Phase 5 | Cleanup + testing | 1 day |
| **Total** | | **5-7.5 days** |
