import { useSettingsStore } from "../zustand/settings";

export const ACCOUNT_BADGES = [1, 2, 3, 4, 5] as const;

export type AccountBadge = (typeof ACCOUNT_BADGES)[number];

/** One flower badge per account, so the account limit matches the number of flowers. */
export const MAX_ACCOUNTS = ACCOUNT_BADGES.length;

export namespace Account {
    /**
     * Returns a valid badge for any input. Invalid or missing badges (for example
     * from imported settings) fall back to the badge at `fallbackIndex`, cycling
     * through the available flowers so a badge image is always rendered.
     */
    export function normalizeBadge(badge: unknown, fallbackIndex = 0): AccountBadge {
        const numeric = typeof badge === "number" || typeof badge === "string" ? Number(badge) : NaN;

        for (const candidate of ACCOUNT_BADGES) {
            if (candidate === numeric) return candidate;
        }

        const safeIndex = Number.isFinite(fallbackIndex) ? Math.trunc(fallbackIndex) : 0;
        const index = ((safeIndex % MAX_ACCOUNTS) + MAX_ACCOUNTS) % MAX_ACCOUNTS;
        return ACCOUNT_BADGES[index];
    }

    export function getNextAvailableBadge(): AccountBadge {
        const badges = useSettingsStore.getState().accounts.map((x) => x.badge);

        // Pick the least used flower instead of only the first unused one: imported
        // settings may contain duplicate or out-of-range badges, and even a list
        // longer than MAX_ACCOUNTS still gets a valid badge instead of none.
        let bestIndex = 0;
        let bestUsage = Infinity;

        ACCOUNT_BADGES.forEach((badge, index) => {
            const usage = badges.filter((x) => Number(x) === badge).length;
            if (usage < bestUsage) {
                bestUsage = usage;
                bestIndex = index;
            }
        });

        return ACCOUNT_BADGES[bestIndex];
    }

    export function generateDisplayNameByToken(token: string) {
        return token.slice(0, 4) + "..." + token.slice(-4);
    }
}
