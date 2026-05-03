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

## Key Patterns

- State management: Zustand with custom `createLogger` middleware
- API calls: Modular loaders in `src/modules/api-client/`
- Platform-specific code: Implement `IPlatformClass` in `helpers/platforms/Electron.ts` or `Web.ts`
- Settings: Managed via `src/helpers/Settings.ts` and Zustand `settings` store
- Notifications: Handled in main process via IPC, renderer triggers via `#preload` API

## Notes

- Electron main process uses CommonJS output (Vite CJS format)
- PWA version deployed via Firebase Hosting (`flowerpot-pwa` project)
- `.env.development` sets `VITE_LOCAL_DYNAMIC_CONTENT=1` and `TARGET_URL`
- No test framework is configured; verify changes manually
- Auto-updater configured for GitHub releases via `electron-updater`
