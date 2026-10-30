import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ACCOUNT_BADGES, Account, MAX_ACCOUNTS } from "../helpers/Account";
import type { IAccount } from "../helpers/Settings";
import { useSettingsStore } from "../zustand/settings";
import { makeAccount, resetStores } from "./test-utils";

function withBadges(badges: unknown[]): IAccount[] {
    return badges.map((badge, index) => ({ ...makeAccount("https://dev.azure.com/org/", `acc${index}`), badge }));
}

beforeEach(() => {
    resetStores();
});

afterEach(() => {
    resetStores();
});

describe("Account badges", () => {
    it("has a flower for every allowed account", () => {
        expect(MAX_ACCOUNTS).toBe(5);
        expect(ACCOUNT_BADGES).toHaveLength(MAX_ACCOUNTS);
    });

    it("returns the first free badge", () => {
        useSettingsStore.getState().setAccounts(withBadges([1, 2]) as IAccount[]);
        expect(Account.getNextAvailableBadge()).toBe(3);
    });

    it("reuses a freed badge", () => {
        useSettingsStore.getState().setAccounts(withBadges([1, 3, 4]) as IAccount[]);
        expect(Account.getNextAvailableBadge()).toBe(2);
    });

    it("still returns a valid badge when every flower is taken", () => {
        useSettingsStore.getState().setAccounts(withBadges(ACCOUNT_BADGES) as IAccount[]);
        expect(ACCOUNT_BADGES).toContain(Account.getNextAvailableBadge());
    });

    it("returns a valid badge for imported settings with duplicate badges", () => {
        useSettingsStore.getState().setAccounts(withBadges([1, 1, 1]) as IAccount[]);
        expect(Account.getNextAvailableBadge()).toBe(2);
    });

    it("normalizes unknown badges instead of leaving an account without a flower", () => {
        expect(Account.normalizeBadge(3)).toBe(3);
        expect(ACCOUNT_BADGES).toContain(Account.normalizeBadge(undefined));
        expect(ACCOUNT_BADGES).toContain(Account.normalizeBadge(0));
        expect(ACCOUNT_BADGES).toContain(Account.normalizeBadge(6));
        expect(ACCOUNT_BADGES).toContain(Account.normalizeBadge("2"));
    });

    it("cycles the fallback badge for imported accounts without a badge", () => {
        expect(Account.normalizeBadge(undefined, 0)).toBe(1);
        expect(Account.normalizeBadge(undefined, 1)).toBe(2);
        expect(Account.normalizeBadge(undefined, MAX_ACCOUNTS)).toBe(1);
        expect(Account.normalizeBadge(undefined, -1)).toBe(ACCOUNT_BADGES[MAX_ACCOUNTS - 1]);
    });
});
