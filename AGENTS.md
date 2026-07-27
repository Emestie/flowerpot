# AGENTS.md - Flowerpot

## Project Overview

Flowerpot is an Electron-based desktop application (also available as a PWA) for monitoring TFS/Azure DevOps work items and pull requests. It tracks queries, sends desktop notifications on changes, and supports multiple accounts with English/Russian localization.

Tech stack: Electron 19, React 19, TypeScript, Vite 6, Zustand, Semantic UI React.

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
- `src/modules/api-client/` - TFS/Azure DevOps API client with loader pattern
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

## Notes

- Electron main process uses CommonJS output (Vite CJS format)
- PWA version deployed via Firebase Hosting (`flowerpot-pwa` project)
- `.env.development` sets `VITE_LOCAL_DYNAMIC_CONTENT=1` and `TARGET_URL`
- No test framework is configured; verify changes manually
- Auto-updater configured for GitHub releases via `electron-updater`
