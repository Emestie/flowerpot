# UI Manifest

Gradual rewrite rules for replacing Semantic UI React with a custom UI kit.

## Rules

1. **Location** — Store all UI primitives (rewritten from semantic-ui) in `src/ui/`
2. **Per-component folder** — Each component gets its own folder, e.g. `src/ui/button/`
3. **Styling** — Use plain CSS or CSS Modules (`.module.css`), whichever fits better
4. **Global CSS** — Put global/shared styles in `src/style/ui.css`
5. **No preprocessors** — Plain CSS only, no Sass/SCSS
6. **File naming** — Always use `kebab-case` for file names
7. **Fidelity** — Reference the original Semantic UI React component during rewrite; result must look and feel identical
8. **Dark theme** — Always account for dark theme
9. **Scope** — Port only features actually used in this project (e.g. don't port XL size if never used)
