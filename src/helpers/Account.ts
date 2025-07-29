import { store } from "../redux/store";

export type AccountBadge = 1 | 2 | 3 | 4 | 5;

export namespace Account {
    export function getNextAvailableBadge(): AccountBadge {
        const badges = store.getState().settings.accounts.map((x) => x.badge);

        for (let i = 1; i <= 5; i++) {
            if (badges.includes(i as AccountBadge)) continue;
            return i as AccountBadge;
        }

        return 5;
    }

    export function generateDisplayNameByToken(token: string) {
        return token.slice(0, 4) + "..." + token.slice(-4);
    }
}
