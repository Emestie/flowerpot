import { TTheme } from "./Settings";

export function isDarkTheme(theme: TTheme): boolean {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getSystemThemeListener(callback: (isDark: boolean) => void): () => void {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
}
