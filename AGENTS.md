# AGENTS.md - Flowerpot

## Project Overview

Flowerpot is an Electron-based desktop application (also available as a PWA) for monitoring Azure DevOps work items and pull requests. It tracks queries, sends desktop notifications on changes, and supports multiple accounts with English/Russian localization.

Tech stack: Electron 43, React 19, TypeScript, Vite 6, Zustand, Semantic UI React.

## Build & Dev Commands

- `npm run dev` - Start development mode with hot reload (Electron + Vite)
- `npm run web` - Start web version dev mode
- `npm run build` - Full build (main + preload + renderer)
- `npm run build:main` - Build Electron main process only
- `npm run build:preload` - Build preload script only
- `npm run build:renderer` - Build renderer (React app) only
- `npm run compile` - Build and package for Windows/macOS via electron-builder
- `npm run deploy-web` - Deploy web version to Firebase
- `npm run prettify` - Format code with Prettier

## Lint & Typecheck

- TypeScript checking is done via `vite-plugin-checker` during development
- Run `npm run build:renderer` to typecheck the renderer process
- Run `cd host/main && tsc` to typecheck the main process
- No ESLint config exists; Prettier is the primary formatter

## Code Style

- **Formatter**: Prettier (tabWidth: 4, printWidth: 120, trailingComma: es5, endOfLine: lf)
- **Run**: `npm run prettify` before committing
- **TypeScript**: Strict mode enabled, target ES2022
- **JSX**: React JSX transform (react-jsx)
- **File naming**: camelCase with type suffix (e.g., `WorkItem.ts`, `MainView.tsx`)
- **Components**: PascalCase functional components with React hooks
- **Interfaces**: PascalCase with `I` prefix (e.g., `IAccount`, `ISettings`)
- **Types/Enums**: PascalCase (e.g., `TView`, `Sections`)
- **Path aliases**: `/@/*` → `./src/*`, `#preload` → `./host/preload/src/index`

## Architecture

- `src/` - Renderer process (React app, components, views, state)
- `host/main/` - Electron main process (window management, IPC, store)
- `host/preload/` - Preload script exposing API to renderer via `#preload`
- `src/zustand/` - Zustand stores (app, data, settings, quick-search)
- `src/modules/api-client/` - Azure DevOps API client with loader pattern
- `src/helpers/Platform.ts` - Platform abstraction (Electron vs Web)
- `src/values/{en,ru}.ts` - Localization strings, use `s()` helper from `Strings.ts`
- `src/style/ui.css` - Base reset, CSS variables (light default), shared component classes, Semantic UI overrides
- `src/style/ui-dark.css` - Dark theme CSS variables and Semantic UI overrides under `.FlowerpotDarkTheme`
- `src/style/schemes/{name}.css` - Per-scheme CSS variable overrides + Semantic UI restyling

## Key Patterns

- State management: Zustand with custom `createLogger` middleware
- API calls: Modular loaders in `src/modules/api-client/`
- Platform-specific code: Implement `IPlatformClass` in `helpers/platforms/Electron.ts` or `Web.ts`
- Settings: Managed via `src/helpers/Settings.ts` and Zustand `settings` store
- Notifications: Handled in main process via IPC, renderer triggers via `#preload` API

## Color Schemes

Color scheme switching uses a `.scheme-{name}` class on `<html>` + root `<div>`, orthogonal to `.FlowerpotDarkTheme`.

To add a new scheme:

1. Create `src/style/schemes/{name}.css` with three blocks:
   - `.scheme-{name}` — light mode CSS variables + Semantic UI overrides
   - `.scheme-{name}.FlowerpotDarkTheme` — dark mode CSS variables + overrides
2. Import it in `src/index.tsx`
3. Add the scheme name to `TColorScheme` type in `src/helpers/Settings.ts`
4. Add a `colorScheme{Name}` localization string to `src/values/{en,ru,be}.ts`
5. Add the option in the dropdown in `src/views/SettingsView/sections/WorkItemsSection.tsx`

### CSS Variable Contract

Components expect these CSS variables (with fallback defaults in `src/style/ui.css`):

| Category | Variables |
|---|---|
| Buttons | `--btn-bg`, `--btn-color`, `--btn-hover-bg`, `--btn-hover-color`, `--btn-active-bg`, `--btn-active-color`, `--btn-primary-bg`, `--btn-primary-hover-bg`, `--btn-primary-focus-bg`, `--btn-primary-active-bg`, `--btn-shadow-color`, `--btn-basic-border`, `--btn-basic-hover-bg`, `--btn-basic-hover-color`, `--btn-basic-hover-border`, `--btn-basic-active-bg`, `--btn-basic-active-color`, `--btn-group-border` |
| Inputs | `--input-bg`, `--input-color`, `--input-border`, `--input-focus-border`, `--input-focus-bg`, `--input-focus-placeholder`, `--input-active-border`, `--input-active-bg`, `--input-placeholder`, `--input-error-bg`, `--input-error-border`, `--input-error-color`, `--input-error-placeholder`, `--input-error-placeholder-focus` |
| Radio | `--radio-color`, `--radio-border`, `--radio-bg`, `--radio-dot`, `--radio-hover-border`, `--radio-focus-border` |
| Checkbox | `--checkbox-color`, `--checkbox-border`, `--checkbox-bg`, `--checkbox-checked-bg`, `--checkbox-checked-color`, `--checkbox-hover-border`, `--checkbox-focus-border` |
| Menu | `--menu-bg`, `--menu-item-color`, `--menu-item-active-bg`, `--menu-item-active-color`, `--menu-item-hover-bg`, `--menu-item-hover-color`, `--menu-item-active-hover-bg` |
| Labels | `--label-bg`, `--label-color`, `--label-basic-border` |
| Table | `--table-bg`, `--table-color`, `--table-border`, `--table-header-bg`, `--table-header-color`, `--table-hover-bg` |
| Card | `--card-bg`, `--card-meta-color` |

Semantic UI class overrides use higher specificity selectors (e.g., `html.scheme-{name}.FlowerpotDarkTheme` beats `html.FlowerpotDarkTheme`).

## PWA Flashbang Prevention (Dark Theme Flash)

### Problem

The PWA/web version had a "flashbang" effect at night: when opening in dark mode, the page rendered white briefly before React loaded settings and applied the `FlowerpotDarkTheme` class. This happened because:
- `ui.css` hardcodes `body { background: #fff; }`
- The theme preference is stored in `localStorage("@settings").flowerpot.theme` and only read after React hydrates
- Before React runs, the white body background is visible

### Solution (3 layers)

1. **Inline sync script in `index.html`** (runs before first paint):
   - Reads `localStorage("@settings")`, parses the `flowerpot` JSON, checks `theme`
   - If `"dark"` or `"system"` + `prefers-color-scheme: dark`: adds `FlowerpotDarkTheme` to `<html>`, sets `document.documentElement.style.backgroundColor`, updates `theme-color` meta tag
   - If no saved settings / parse error → silently falls through to layer 2

2. **CSS `@media (prefers-color-scheme: dark)` in `ui.css`**:
   - Sets `body { background: #1b1c1d; color: rgba(255, 255, 255, 0.9); }`
   - Covers system-theme users who haven't saved a preference yet

3. **React `App.tsx` effect**:
   - When `isDark` changes, updates `theme-color` meta tag dynamically (dark → `#1b1c1d`, light → `#000000`)
   - Sets `document.documentElement.style.backgroundColor` and root `<div>` background to match

### Files involved

| File | Role |
|---|---|
| `index.html` | Inline `<script>` + `id="theme-color"` on `<meta>` |
| `src/style/ui.css` | `@media (prefers-color-scheme: dark)` fallback |
| `src/components/App.tsx` | Dynamic theme-color + html background on theme change |
| `public/manifest.json` | `background_color: "#1b1c1d"` (PWA splash screen) |

### Notes

- The inline script uses generic `#1b1c1d` for dark background, not scheme-specific colors (Flexoki uses `#100f0f`). This is fine: the scheme CSS overrides it on first render, and both values are very dark — the transition is a subtle hue shift, not a brightness flash.
- Flexoki light mode users still get a brief `#fff` body before Flexoki's `#fffcf0` takes over, but this is not a "flashbang" since they're already in light mode.
- The `manifest.json` `background_color` controls the PWA native splash screen. Changed from `#ffffff` to `#1b1c1d` so it doesn't flash white on PWA launch in dark mode.

## Electron Version Pin (41.x)

The app is intentionally pinned to **Electron ^41** (`electron` in `package.json`) instead of the newest major.

### Why

- Electron 42 migrated macOS notifications from the deprecated `NSUserNotification` API to `UNNotification` ([electron#47817](https://github.com/electron/electron/pull/47817)).
- The new API **requires a code-signed app**: unsigned/ad-hoc-signed binaries emit a silent `failed` event on the `Notification` object (`UNErrorDomain error 1`) and no banner ever shows.
- Dev mode runs from `node_modules/electron/dist/Electron.app`, which is only ad-hoc signed, so notifications would silently stop working on every developer machine.

### Before upgrading past 41

1. Verify native notifications work unsigned on macOS dev builds (test harness: `new Notification(...)` + listen for `show`/`failed` events).
2. If they don't, plan for code signing of local dev builds (self-signed cert + re-signing helpers with correct entitlements) or accept broken notifications during development.
3. Packaged builds are unaffected once built with a real signing identity (`CSC_LINK`/`CSC_NAME`).

## Notes

- Electron main process uses CommonJS output (Vite CJS format)
- PWA version deployed via Firebase Hosting (`flowerpot-pwa` project)
- `.env.development` sets `VITE_LOCAL_DYNAMIC_CONTENT=1` and `TARGET_URL`
- No test framework is configured; verify changes manually
- Auto-updater configured for GitHub releases via `electron-updater`
